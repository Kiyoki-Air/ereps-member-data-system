from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from backend.app.core.database import get_db
from backend.app.models.member import Member, Qualification, MemberProfile, MemberLink, AuditLog
from backend.app.schemas.member import (
    MemberDetailResponse, MemberListResponse, ManualCorrectionRequest
)
from backend.app.services.data_quality import DataQualityEngine
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/members", tags=["Members"])

@router.get("", response_model=MemberListResponse)
def list_members(
    search: Optional[str] = Query(None, description="Search across member name or membership ID"),
    country: Optional[str] = Query(None, description="Filter by standardized country"),
    city: Optional[str] = Query(None, description="Filter by city"),
    qualification: Optional[str] = Query(None, description="Filter by qualification / discipline"),
    master_trainer_only: Optional[bool] = Query(False, description="Filter Master Trainers only"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db)
):
    query = db.query(Member).filter(Member.is_deleted == False)

    # Unwrap Query defaults if called directly in tests
    search_val = search if isinstance(search, str) else None
    country_val = country if isinstance(country, str) else None
    city_val = city if isinstance(city, str) else None
    qual_val = qualification if isinstance(qualification, str) else None
    mt_val = master_trainer_only if isinstance(master_trainer_only, bool) else False
    page_val = page if isinstance(page, int) else 1
    page_size_val = page_size if isinstance(page_size, int) else 20
    sort_by_val = sort_by if isinstance(sort_by, str) else "created_at"
    sort_desc_val = sort_desc if isinstance(sort_desc, bool) else True

    if search_val:
        search_term = f"%{search_val.strip()}%"
        query = query.filter(
            or_(
                Member.full_name.ilike(search_term),
                Member.member_id.ilike(search_term),
                Member.city.ilike(search_term),
                Member.country.ilike(search_term)
            )
        )

    if country_val:
        query = query.filter(Member.country == country_val)

    if city_val:
        query = query.filter(Member.city.ilike(f"%{city_val}%"))

    if qual_val:
        query = query.filter(Member.professional_category.ilike(f"%{qual_val}%"))

    if mt_val:
        query = query.filter(Member.master_trainer_status == True)

    total = query.count()

    # Sorting
    sort_column = getattr(Member, sort_by_val, Member.created_at)
    if sort_desc_val:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    offset = (page_val - 1) * page_size_val
    items = query.offset(offset).limit(page_size_val).all()
    total_pages = max(1, (total + page_size_val - 1) // page_size_val)

    return MemberListResponse(
        items=items,
        total=total,
        page=page_val,
        page_size=page_size_val,
        total_pages=total_pages
    )

@router.get("/{member_id}", response_model=MemberDetailResponse)
def get_member_detail(member_id: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.member_id == member_id, Member.is_deleted == False).first()
    if not member:
        raise HTTPException(status_code=404, detail=f"Member {member_id} not found")
    return member

@router.post("/{member_id}/correct", response_model=MemberDetailResponse)
def manual_record_correction(
    member_id: str,
    correction: ManualCorrectionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Module 9 & 10: Allows administrators to manually correct data attributes with full audit tracking.
    """
    member = db.query(Member).filter(Member.member_id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    old_val = getattr(member, correction.field_name, None)
    if not hasattr(member, correction.field_name):
        raise HTTPException(status_code=400, detail=f"Field {correction.field_name} does not exist on Member")

    # Standardize if country or date
    new_val = correction.new_value
    if correction.field_name == "country":
        new_val, _ = DataQualityEngine.standardize_country(str(new_val))
    elif correction.field_name == "expiry_date":
        new_val = DataQualityEngine.standardize_date(str(new_val))

    setattr(member, correction.field_name, new_val)

    # Log audit trail
    audit = AuditLog(
        user_id=current_user.username if current_user else "admin",
        action="manual_correction",
        entity_type="member",
        entity_id=member_id,
        changes={
            "field": correction.field_name,
            "old_value": str(old_val),
            "new_value": str(new_val),
            "reason": correction.correction_reason
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(member)
    return member
