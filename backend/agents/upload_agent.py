import uuid
import os
import shutil
from fastapi import UploadFile
from models.schema import VerificationJob, JobStatus, DocumentCategory
from sqlalchemy.orm import Session
from datetime import datetime

class UploadManagerAgent:
    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def handle_upload(self, file: UploadFile, db: Session) -> VerificationJob:
        # Generate unique ID for the job
        job_id = str(uuid.uuid4())
        
        # Save file locally (In production, this uploads to Cloudinary/S3)
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        local_filename = f"{job_id}{file_extension}"
        local_path = os.path.join(self.upload_dir, local_filename)
        
        with open(local_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create DB record
        new_job = VerificationJob(
            id=job_id,
            filename=file.filename,
            original_url=local_path, # Local path for now
            status=JobStatus.PENDING,
            document_type=DocumentCategory.UNKNOWN
        )
        
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        
        return new_job
