from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from models.database import get_db, SessionLocal
from models.schema import (
    VerificationJob, JobStatus, EvidenceType,
    VerificationEvidence, DocumentCategory,
)
from agents.upload_agent import UploadManagerAgent
from agents.ocr_agent import OCRAgent, OCR_FAILURE_PREFIX
from agents.adk_orchestrator import run_adk_pipeline
from worker import celery_app
import uuid

router = APIRouter()

upload_agent = UploadManagerAgent()
ocr_agent = OCRAgent()


def process_verification_task(job_id: str, file_path: str):
    db = SessionLocal()
    try:
        job = db.query(VerificationJob).filter(VerificationJob.id == job_id).first()
        if not job:
            return

        # ------------------------------------------------------------------
        # Step 1: Extract Text (OCR / PDF / TXT)
        # ------------------------------------------------------------------
        job.status = JobStatus.EXTRACTING
        db.commit()

        extracted_text = ocr_agent.extract_text(file_path)

        # Gate: if OCR failed, mark the job as FAILED immediately — do NOT
        # pass the error string to the AI or score it.
        if extracted_text.startswith(OCR_FAILURE_PREFIX):
            error_detail = extracted_text[len(OCR_FAILURE_PREFIX):].strip()
            job.trust_score = 0.0
            job.confidence = 1.0  # We are 100% confident it failed
            job.summary = f"Document extraction failed: {error_detail}"
            job.recommendation = "REJECT: Re-upload a valid, readable document."
            job.status = JobStatus.FAILED

            # Record OCR failure as a red-flag evidence item
            db.add(VerificationEvidence(
                job_id=job.id,
                evidence_type=EvidenceType.RED_FLAG,
                description=f"[OCR] {error_detail}",
                severity_or_confidence=1.0,
            ))
            db.commit()
            print(f"[verify] Job {job_id} failed at OCR stage: {error_detail}")
            return

        # ------------------------------------------------------------------
        # Step 2: Run the full ADK Agentic Pipeline
        # ------------------------------------------------------------------
        job.status = JobStatus.ANALYZING
        db.commit()

        adk_result = run_adk_pipeline(extracted_text)

        # If the pipeline itself detected an OCR-like failure (shouldn't happen
        # after the gate above, but guard anyway)
        if adk_result.get("ocr_failed"):
            job.trust_score = 0.0
            job.confidence = 1.0
            job.summary = adk_result.get("summary", "Extraction failed.")
            job.recommendation = adk_result.get("recommendation", "REJECT.")
            job.status = JobStatus.FAILED
            db.commit()
            return

        # ------------------------------------------------------------------
        # Step 3: Persist Evidence Items
        # ------------------------------------------------------------------

        # Save document category if returned
        raw_category = adk_result.get("document_category", "UNKNOWN").upper()
        try:
            job.document_type = DocumentCategory[raw_category]
        except KeyError:
            job.document_type = DocumentCategory.UNKNOWN

        # AI Red Flags
        for flag in adk_result.get("ai_flags", []):
            db.add(VerificationEvidence(
                job_id=job.id,
                evidence_type=EvidenceType.RED_FLAG,
                description=f"[AI] {flag}",
                severity_or_confidence=0.85,
            ))

        # AI Positive Indicators
        for pos in adk_result.get("ai_positive", []):
            db.add(VerificationEvidence(
                job_id=job.id,
                evidence_type=EvidenceType.POSITIVE_INDICATOR,
                description=f"[AI] {pos}",
                severity_or_confidence=0.75,
            ))

        # ------------------------------------------------------------------
        # Step 4: Finalise Job
        # ------------------------------------------------------------------
        job.trust_score = adk_result.get("trust_score", 50)
        job.confidence = 0.90
        job.summary = adk_result.get("summary", "Analysis completed.")
        job.recommendation = adk_result.get("recommendation", "Review completed.")
        job.status = JobStatus.COMPLETED
        db.commit()

    except Exception as e:
        db.rollback()
        job = db.query(VerificationJob).filter(VerificationJob.id == job_id).first()
        if job:
            job.status = JobStatus.FAILED
            job.summary = f"Unexpected pipeline error: {e}"
            db.commit()
        print(f"[verify] Unexpected task error for job {job_id}: {e}")
    finally:
        db.close()


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Agent 1: Handle Upload
    job = await upload_agent.handle_upload(file, db)

    # Trigger background processing via FastAPI BackgroundTasks
    background_tasks.add_task(process_verification_task, job.id, job.original_url)

    return {"job_id": job.id, "status": job.status}


@router.get("/status/{job_id}")
async def get_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(VerificationJob).filter(VerificationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    evidence = (
        db.query(VerificationEvidence)
        .filter(VerificationEvidence.job_id == job_id)
        .all()
    )

    return {
        "job_id": job.id,
        "filename": job.filename,
        "status": job.status,
        "document_type": job.document_type,
        "trust_score": job.trust_score,
        "confidence": job.confidence,
        "summary": job.summary,
        "recommendation": job.recommendation,
        "evidence": [
            {
                "type": e.evidence_type,
                "description": e.description,
                "severity_or_confidence": e.severity_or_confidence,
            }
            for e in evidence
        ],
    }
