from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from models.database import get_db
from models.schema import VerificationJob, JobStatus, EvidenceType, VerificationEvidence, DocumentCategory
from agents.upload_agent import UploadManagerAgent
from agents.ocr_agent import OCRAgent
from agents.rule_agent import RuleEngineAgent
from agents.gemini_agent import GeminiAgent
from agents.scoring_engine import RiskScoringEngine
import uuid

router = APIRouter()

upload_agent = UploadManagerAgent()
ocr_agent = OCRAgent()
rule_agent = RuleEngineAgent()
gemini_agent = GeminiAgent()
scoring_engine = RiskScoringEngine()

def process_verification_task(job_id: str, file_path: str, db: Session):
    try:
        job = db.query(VerificationJob).filter(VerificationJob.id == job_id).first()
        if not job:
            return
            
        # Step 1: OCR
        job.status = JobStatus.EXTRACTING
        db.commit()
        
        extracted_text = ocr_agent.extract_text(file_path)
        
        # Classify Document using Gemini
        document_category = gemini_agent.classify_document(extracted_text)
        job.document_type = DocumentCategory(document_category) if document_category in [e.value for e in DocumentCategory] else DocumentCategory.UNKNOWN
        db.commit()

        # Step 2: Rule Engine
        job.status = JobStatus.ANALYZING
        db.commit()
        
        flags = rule_agent.evaluate(extracted_text, job.document_type.value)
        
        # Save hard flags to DB
        for flag in flags:
            evidence = VerificationEvidence(
                job_id=job.id,
                evidence_type=EvidenceType.RED_FLAG,
                description=f"[{flag['category']}] {flag['description']} (Matched: '{flag['matched_text']}')",
                severity_or_confidence=0.8
            )
            db.add(evidence)
            
        # Step 3: AI Semantic Analysis
        ai_result = gemini_agent.analyze_trust(extracted_text, job.document_type.value)
        
        for ai_flag in ai_result.get('ai_flags', []):
             evidence = VerificationEvidence(
                job_id=job.id,
                evidence_type=EvidenceType.RED_FLAG,
                description=f"[AI] {ai_flag}",
                severity_or_confidence=0.6
            )
             db.add(evidence)
             
        for ai_pos in ai_result.get('ai_positive', []):
             evidence = VerificationEvidence(
                job_id=job.id,
                evidence_type=EvidenceType.POSITIVE_INDICATOR,
                description=f"[AI] {ai_pos}",
                severity_or_confidence=0.7
            )
             db.add(evidence)

        # Step 4: Final Trust Scoring
        final_score = scoring_engine.calculate_score(
            rule_flags=flags,
            ai_analysis=ai_result,
            metadata_score=90, # Mocked for now
            ocr_consistency=95, # Mocked for now
            integrity_score=100 # Mocked for now
        )
        
        job.trust_score = final_score
        job.confidence = 0.90
        job.summary = ai_result.get('summary', 'Analysis completed.')
        job.recommendation = ai_result.get('recommendation', 'Review completed.')
            
        job.status = JobStatus.COMPLETED
        db.commit()
        
    except Exception as e:
        db.rollback()
        job = db.query(VerificationJob).filter(VerificationJob.id == job_id).first()
        if job:
            job.status = JobStatus.FAILED
            db.commit()
        print(f"Task Error: {e}")

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Agent 1: Handle Upload
    job = await upload_agent.handle_upload(file, db)
    
    # Trigger background task for processing (Agents 2 & 3)
    # In a full production setup with Redis, this would be `verify_task.delay(job.id, job.original_url)`
    background_tasks.add_task(process_verification_task, job.id, job.original_url, db)
    
    return {"job_id": job.id, "status": job.status}

@router.get("/status/{job_id}")
async def get_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(VerificationJob).filter(VerificationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    evidence = db.query(VerificationEvidence).filter(VerificationEvidence.job_id == job_id).all()
    
    return {
        "job_id": job.id,
        "filename": job.filename,
        "status": job.status,
        "trust_score": job.trust_score,
        "summary": job.summary,
        "recommendation": job.recommendation,
        "evidence": [
            {
                "type": e.evidence_type,
                "description": e.description
            } for e in evidence
        ]
    }
