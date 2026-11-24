from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.member import ExtractionJob, ExtractionLog, FailedRecord
from backend.app.schemas.member import (
    JobCreate, ExtractionJobResponse, ExtractionLogResponse, FailedRecordResponse
)
from backend.app.services.extraction_engine import ExtractionEngine

router = APIRouter(prefix="/extraction", tags=["Extraction Engine"])

import threading
from backend.app.core.database import SessionLocal

def run_job_in_thread(job_id: str, job_type: str, target_count: int = 150000):
    thread_db = SessionLocal()
    try:
        if job_type in ("mock_50", "combined", "listing"):
            ExtractionEngine.run_mock_50_dataset(thread_db, job_id)
        elif job_type == "scale_150k":
            ExtractionEngine.benchmark_scale_150k(thread_db, target_count=target_count, batch_size=5000, job_id=job_id)
    finally:
        thread_db.close()

@router.post("/jobs", response_model=ExtractionJobResponse)
def trigger_extraction_job(
    request: JobCreate,
    db: Session = Depends(get_db)
):
    """
    Initializes and triggers an extraction workflow.
    - 'mock_50': Runs the 50-member realistic test suite.
    - 'scale_150k': Runs the high-performance synthetic 150,000 scale milestone.
    - 'live_directory': Checks authorization before initiating live collection.
    """
    if request.job_type == "live_directory" and not request.authorized_token:
        raise HTTPException(
            status_code=403,
            detail="EREPS Authorization Required: Live extraction requires an authorized partner token or EREPS data agreement."
        )

    job = ExtractionEngine.create_job(
        db=db,
        job_type=request.job_type,
        batch_size=request.batch_size,
        rate_limit_per_min=request.rate_limit_per_min
    )

    t = threading.Thread(target=run_job_in_thread, args=(job.id, request.job_type), daemon=True)
    t.start()

    return job

@router.get("/jobs", response_model=List[ExtractionJobResponse])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(ExtractionJob).order_by(ExtractionJob.created_at.desc()).limit(20).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=ExtractionJobResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/jobs/{job_id}/pause")
def pause_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "paused"
    ExtractionEngine.log_action(db, job_id, "WARNING", f"Job {job_id} paused by operator.")
    db.commit()
    return {"message": f"Job {job_id} paused successfully."}

@router.post("/jobs/{job_id}/resume")
def resume_job(job_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "running"
    ExtractionEngine.log_action(db, job_id, "INFO", f"Job {job_id} resumed from checkpoint.")
    db.commit()
    background_tasks.add_task(ExtractionEngine.run_mock_50_dataset, db, job.id)
    return {"message": f"Job {job_id} resumed."}

@router.post("/jobs/{job_id}/retry")
def retry_failed_records(job_id: str, db: Session = Depends(get_db)):
    result = ExtractionEngine.retry_failed_records(db, job_id)
    return result

@router.get("/jobs/{job_id}/logs", response_model=List[ExtractionLogResponse])
def get_job_logs(job_id: str, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(ExtractionLog).filter(ExtractionLog.job_id == job_id).order_by(ExtractionLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/failures", response_model=List[FailedRecordResponse])
def list_failures(
    job_id: Optional[str] = None, 
    status: Optional[str] = None, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    query = db.query(FailedRecord)
    if job_id:
        query = query.filter(FailedRecord.job_id == job_id)
    if status:
        query = query.filter(FailedRecord.status == status)
    failures = query.order_by(FailedRecord.created_at.desc()).limit(limit).all()
    return failures
