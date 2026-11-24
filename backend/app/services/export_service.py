import os
import csv
import io
import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.member import (
    Member, Qualification, MemberProfile, MemberLink, ExtractionLog, FailedRecord
)
from backend.app.core.config import settings

class ExportService:
    """
    Dedicated Excel and CSV Export Center.
    Generates structured multi-sheet Excel workbooks using OpenPyXL with professional enterprise styling,
    as well as modular CSV exports.
    """

    HEADER_FILL = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid") # Deep Enterprise Blue
    HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    DATA_FONT = Font(name="Calibri", size=10)
    BORDER_THIN = Border(
        left=Side(style='thin', color='E5E7EB'),
        right=Side(style='thin', color='E5E7EB'),
        top=Side(style='thin', color='E5E7EB'),
        bottom=Side(style='thin', color='E5E7EB')
    )

    @classmethod
    def apply_sheet_styling(cls, ws, headers: List[str]):
        """Applies header formatting, cell styling and auto-fits column widths with fast sampling."""
        ws.views.sheetView[0].showGridLines = True
        
        # Format Header Row
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.value = header
            cell.fill = cls.HEADER_FILL
            cell.font = cls.HEADER_FONT
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=False)
            ws.row_dimensions[1].height = 26

            # Set fast sensible column widths
            col_letter = get_column_letter(col_num)
            ws.column_dimensions[col_letter].width = max(len(header) + 6, 16)

    @classmethod
    def generate_excel_workbook(
        cls, 
        db: Session, 
        country: Optional[str] = None, 
        qualification: Optional[str] = None
    ) -> str:
        """
        Generates the complete 5-Sheet Master Workbook as specified in Module 8:
        SHEET 1: ALL MEMBERS
        SHEET 2: MEMBER PROFILES
        SHEET 3: SOCIAL MEDIA LINKS
        SHEET 4: WEBSITES
        SHEET 5: EXTRACTION LOGS
        """
        wb = openpyxl.Workbook()
        # Remove default sheet
        wb.remove(wb.active)

        # Base Member Query
        query = db.query(Member).filter(Member.is_deleted == False)
        if country:
            query = query.filter(Member.country == country)
        if qualification:
            query = query.filter(Member.professional_category.ilike(f"%{qualification}%"))
            
        members = query.all()
        member_ids = [m.member_id for m in members]

        # ----------------------------------------------------
        # SHEET 1: ALL MEMBERS
        # ----------------------------------------------------
        ws1 = wb.create_sheet(title="ALL MEMBERS")
        headers1 = [
            "Member ID", "First Name", "Last Name", "Full Name", 
            "City", "Country", "Professional Qualification", 
            "Master Trainer", "Membership Expiry", "Profile URL", "Source Provenance"
        ]
        ws1.append(headers1)
        
        for m in members:
            ws1.append([
                m.member_id,
                m.first_name or "",
                m.last_name or "",
                m.full_name,
                m.city or "",
                m.country or "",
                m.professional_category or "",
                "YES" if m.master_trainer_status else "NO",
                m.expiry_date or "",
                m.profile_url or "",
                m.source_provenance or ""
            ])
        cls.apply_sheet_styling(ws1, headers1)

        # ----------------------------------------------------
        # SHEET 2: MEMBER PROFILES
        # ----------------------------------------------------
        ws2 = wb.create_sheet(title="MEMBER PROFILES")
        headers2 = [
            "Member ID", "Full Name", "Professional Description", "Specialties", 
            "Certifications / EQF", "Business Name", "Business Email", "Business Phone", "Original URL", "Extracted At"
        ]
        ws2.append(headers2)

        # Query all profiles directly without parameter limit
        profiles = db.query(MemberProfile).all()
        profile_dict = {p.member_id: p for p in profiles}
        for m in members:
            p = profile_dict.get(m.member_id)
            ws2.append([
                m.member_id,
                m.full_name,
                p.description if p and p.description else "",
                p.specialties if p and p.specialties else "",
                p.certifications_text if p and p.certifications_text else "",
                p.business_name if p and p.business_name else "",
                p.business_email if p and p.business_email else "",
                p.business_phone if p and p.business_phone else "",
                p.original_profile_url if p and p.original_profile_url else m.profile_url or "",
                p.extraction_date.strftime("%Y-%m-%d %H:%M:%S") if p and p.extraction_date else ""
            ])
        cls.apply_sheet_styling(ws2, headers2)

        # ----------------------------------------------------
        # SHEET 3: SOCIAL MEDIA LINKS
        # ----------------------------------------------------
        ws3 = wb.create_sheet(title="SOCIAL MEDIA LINKS")
        headers3 = [
            "Member ID", "Member Name", "Platform", "Original URL", 
            "Clean URL", "Verification Status", "Last Checked", "Source Profile URL"
        ]
        ws3.append(headers3)

        social_links = db.query(MemberLink).filter(MemberLink.link_type == "social").all()
        member_name_map = {m.member_id: m.full_name for m in members}
        for link in social_links:
            if link.member_id in member_name_map:
                ws3.append([
                    link.member_id,
                    member_name_map.get(link.member_id, ""),
                    link.platform.upper(),
                    link.original_url,
                    link.clean_url,
                    "VERIFIED" if link.is_verified else "UNVERIFIED",
                    link.last_checked.strftime("%Y-%m-%d %H:%M:%S") if link.last_checked else "",
                    link.source_profile_url or ""
                ])
        cls.apply_sheet_styling(ws3, headers3)

        # ----------------------------------------------------
        # SHEET 4: WEBSITES
        # ----------------------------------------------------
        ws4 = wb.create_sheet(title="WEBSITES")
        headers4 = [
            "Member ID", "Member Name", "Website URL", "Link Type", 
            "Platform / Category", "Verification Status", "Last Checked"
        ]
        ws4.append(headers4)

        web_links = db.query(MemberLink).filter(
            MemberLink.link_type.in_(["website", "portfolio", "directory"])
        ).all()
        for link in web_links:
            if link.member_id in member_name_map:
                ws4.append([
                    link.member_id,
                    member_name_map.get(link.member_id, ""),
                    link.clean_url or link.original_url,
                    link.link_type,
                    link.platform,
                    "VERIFIED" if link.is_verified else "UNVERIFIED",
                    link.last_checked.strftime("%Y-%m-%d %H:%M:%S") if link.last_checked else ""
                ])
        cls.apply_sheet_styling(ws4, headers4)

        # ----------------------------------------------------
        # SHEET 5: EXTRACTION LOGS
        # ----------------------------------------------------
        ws5 = wb.create_sheet(title="EXTRACTION LOGS")
        headers5 = [
            "Log ID", "Job ID", "Member ID", "Level", "Message", "Timestamp", "Error Details"
        ]
        ws5.append(headers5)

        logs = db.query(ExtractionLog).order_by(ExtractionLog.timestamp.desc()).limit(1000).all()
        for log in logs:
            ws5.append([
                log.id,
                log.job_id,
                log.member_id or "",
                log.log_level,
                log.message,
                log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "",
                log.error_details or ""
            ])
        cls.apply_sheet_styling(ws5, headers5)

        # Save Workbook
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"EREPS_Master_Export_{timestamp_str}.xlsx"
        filepath = os.path.join(settings.EXPORT_DIR, filename)
        wb.save(filepath)
        return filepath

    @classmethod
    def generate_csv_export(cls, db: Session, export_type: str = "members") -> str:
        """Generates standard CSV exports for members, profiles, links, or failed records."""
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"EREPS_{export_type}_{timestamp_str}.csv"
        filepath = os.path.join(settings.EXPORT_DIR, filename)

        with open(filepath, mode="w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            if export_type == "members":
                writer.writerow(["Member ID", "First Name", "Last Name", "Full Name", "City", "Country", "Qualification", "Master Trainer", "Expiry Date", "Profile URL"])
                members = db.query(Member).filter(Member.is_deleted == False).all()
                for m in members:
                    writer.writerow([m.member_id, m.first_name or "", m.last_name or "", m.full_name, m.city or "", m.country or "", m.professional_category or "", "YES" if m.master_trainer_status else "NO", m.expiry_date or "", m.profile_url or ""])
            elif export_type == "links":
                writer.writerow(["Member ID", "Platform", "Original URL", "Clean URL", "Link Type", "Is Verified", "Last Checked"])
                links = db.query(MemberLink).all()
                for l in links:
                    writer.writerow([l.member_id, l.platform, l.original_url, l.clean_url, l.link_type, "YES" if l.is_verified else "NO", l.last_checked.isoformat() if l.last_checked else ""])
            elif export_type == "failed":
                writer.writerow(["ID", "Job ID", "Member ID", "Record Identifier", "Stage", "Error Reason", "Retry Count", "Status", "Created At"])
                failures = db.query(FailedRecord).all()
                for fl in failures:
                    writer.writerow([fl.id, fl.job_id, fl.member_id or "", fl.record_identifier, fl.stage, fl.error_reason, fl.retry_count, fl.status, fl.created_at.isoformat() if fl.created_at else ""])
            else:
                writer.writerow(["Key", "Value"])

        return filepath
