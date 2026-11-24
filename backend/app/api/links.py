import math
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from backend.app.core.database import get_db
from backend.app.models.member import MemberLink, Member
from backend.app.schemas.member import MemberLinkResponse, MemberLinkPagedResponse

router = APIRouter(prefix="/links", tags=["Social Media & Websites"])

@router.get("", response_model=List[MemberLinkResponse])
def list_links(
    platform: Optional[str] = Query(None, description="Filter platform: instagram, linkedin, facebook, youtube, twitter_x, tiktok, personal_website, business_website"),
    link_type: Optional[str] = Query(None, description="social or website"),
    verified_only: Optional[bool] = Query(False),
    search: Optional[str] = Query(None, description="Search member ID or URL"),
    category: Optional[str] = Query(None, description="Category: all, social, website"),
    limit: Optional[int] = Query(None, ge=1, le=50000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(MemberLink)

    p_val = platform if isinstance(platform, str) else None
    lt_val = link_type if isinstance(link_type, str) else None
    cat_val = category if isinstance(category, str) else None
    vo_val = verified_only if isinstance(verified_only, bool) else False
    s_val = search.strip() if isinstance(search, str) and search.strip() else None
    lim_val = limit if (isinstance(limit, int) and limit > 0) else 10000
    off_val = offset if isinstance(offset, int) else 0

    if p_val:
        query = query.filter(MemberLink.platform == p_val.lower())
    if lt_val:
        query = query.filter(MemberLink.link_type == lt_val.lower())
    if cat_val:
        if cat_val.lower() == "website":
            query = query.filter(
                or_(
                    MemberLink.link_type.in_(["website", "portfolio", "directory"]),
                    MemberLink.platform.in_(["personal_website", "business_website", "website"])
                )
            )
        elif cat_val.lower() == "social":
            query = query.filter(
                MemberLink.link_type == "social",
                MemberLink.platform.in_(["instagram", "facebook", "linkedin", "youtube", "twitter_x", "tiktok"])
            )
    if vo_val:
        query = query.filter(MemberLink.is_verified == True)
    if s_val:
        query = query.filter(
            or_(
                MemberLink.member_id.ilike(f"%{s_val}%"),
                MemberLink.clean_url.ilike(f"%{s_val}%"),
                MemberLink.original_url.ilike(f"%{s_val}%"),
                MemberLink.platform.ilike(f"%{s_val}%")
            )
        )

    links = query.order_by(MemberLink.last_checked.desc()).offset(off_val).limit(lim_val).all()
    return links

@router.get("/paged", response_model=MemberLinkPagedResponse)
def list_links_paged(
    search: Optional[str] = Query(None, description="Search member ID or URL"),
    platform: Optional[str] = Query(None, description="Filter platform"),
    link_type: Optional[str] = Query(None, description="social or website"),
    category: Optional[str] = Query(None, description="all, social, website"),
    verified_only: Optional[bool] = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=5000),
    db: Session = Depends(get_db)
):
    query = db.query(MemberLink)

    p_val = platform.strip().lower() if isinstance(platform, str) and platform.strip() else None
    lt_val = link_type.strip().lower() if isinstance(link_type, str) and link_type.strip() else None
    cat_val = category.strip().lower() if isinstance(category, str) and category.strip() else None
    vo_val = verified_only if isinstance(verified_only, bool) else False
    s_val = search.strip() if isinstance(search, str) and search.strip() else None

    if p_val:
        query = query.filter(MemberLink.platform == p_val)
    if lt_val:
        query = query.filter(MemberLink.link_type == lt_val)
    if cat_val:
        if cat_val == "website":
            query = query.filter(
                or_(
                    MemberLink.link_type.in_(["website", "portfolio", "directory"]),
                    MemberLink.platform.in_(["personal_website", "business_website", "website"])
                )
            )
        elif cat_val == "social":
            query = query.filter(
                MemberLink.link_type == "social",
                MemberLink.platform.in_(["instagram", "facebook", "linkedin", "youtube", "twitter_x", "tiktok"])
            )
    if vo_val:
        query = query.filter(MemberLink.is_verified == True)
    if s_val:
        query = query.filter(
            or_(
                MemberLink.member_id.ilike(f"%{s_val}%"),
                MemberLink.clean_url.ilike(f"%{s_val}%"),
                MemberLink.original_url.ilike(f"%{s_val}%"),
                MemberLink.platform.ilike(f"%{s_val}%")
            )
        )

    total = query.count()
    
    # Aggregates across matching query or globally
    total_members_with_links = db.query(MemberLink.member_id).distinct().count()
    total_social_links = db.query(MemberLink).filter(MemberLink.link_type == "social").count()
    total_website_links = db.query(MemberLink).filter(
        or_(
            MemberLink.link_type.in_(["website", "portfolio", "directory"]),
            MemberLink.platform.in_(["personal_website", "business_website", "website"])
        )
    ).count()

    offset = (page - 1) * page_size
    items = query.order_by(MemberLink.last_checked.desc()).offset(offset).limit(page_size).all()
    total_pages = max(1, math.ceil(total / page_size))

    return MemberLinkPagedResponse(
        items=items,
        total=total,
        total_members_with_links=total_members_with_links,
        total_social_links=total_social_links,
        total_website_links=total_website_links,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post("/{link_id}/toggle-verify", response_model=MemberLinkResponse)
def toggle_link_verification(link_id: int, db: Session = Depends(get_db)):
    link = db.query(MemberLink).filter(MemberLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    link.is_verified = not link.is_verified
    db.commit()
    db.refresh(link)
    return link
