import os
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.core.database import get_db
from backend.app.services.export_service import ExportService
from backend.app.models.member import AuditLog
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/export", tags=["Excel & CSV Export"])

@router.get("/excel")
def export_excel_workbook(
    country: Optional[str] = Query(None, description="Filter export by country"),
    qualification: Optional[str] = Query(None, description="Filter export by qualification"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Module 8: Generates and serves the complete 5-Sheet OpenPyXL Master Workbook:
    SHEET 1: ALL MEMBERS
    SHEET 2: MEMBER PROFILES
    SHEET 3: SOCIAL MEDIA LINKS
    SHEET 4: WEBSITES
    SHEET 5: EXTRACTION LOGS
    """
    filepath = ExportService.generate_excel_workbook(db, country=country, qualification=qualification)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.username if current_user else "admin",
        action="export_excel",
        entity_type="export",
        entity_id=os.path.basename(filepath),
        changes={"country": country, "qualification": qualification}
    )
    db.add(audit)
    db.commit()

    filename = os.path.basename(filepath)
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/csv")
def export_csv_data(
    export_type: str = Query("members", description="members, links, or failed"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generates and serves standard CSV exports."""
    filepath = ExportService.generate_csv_export(db, export_type=export_type)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.username if current_user else "admin",
        action="export_csv",
        entity_type="export",
        entity_id=os.path.basename(filepath),
        changes={"export_type": export_type}
    )
    db.add(audit)
    db.commit()

    filename = os.path.basename(filepath)
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="text/csv"
    )
