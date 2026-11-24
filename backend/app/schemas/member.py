from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "operator"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# --- Link Schemas ---
class MemberLinkBase(BaseModel):
    platform: str
    original_url: str
    clean_url: Optional[str] = None
    link_type: str = "social"
    is_verified: bool = True
    source_profile_url: Optional[str] = None

class MemberLinkCreate(MemberLinkBase):
    pass

class MemberLinkResponse(MemberLinkBase):
    id: int
    member_id: str
    last_checked: datetime
    class Config:
        from_attributes = True

class MemberLinkPagedResponse(BaseModel):
    items: List[MemberLinkResponse]
    total: int
    total_members_with_links: int
    total_social_links: int
    total_website_links: int
    page: int
    page_size: int
    total_pages: int


# --- Qualification Schemas ---
class QualificationBase(BaseModel):
    qualification_name: str
    eqf_level: Optional[str] = None
    discipline: Optional[str] = None
    awarding_body: Optional[str] = None
    expiry_date: Optional[str] = None
    is_master_trainer: bool = False

class QualificationCreate(QualificationBase):
    pass

class QualificationResponse(QualificationBase):
    id: int
    member_id: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Profile Schemas ---
class MemberProfileBase(BaseModel):
    description: Optional[str] = None
    specialties: Optional[str] = None
    certifications_text: Optional[str] = None
    business_name: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    business_address: Optional[str] = None
    original_profile_url: Optional[str] = None
    source_status: str = "extracted"
    missing_fields: Optional[str] = None

class MemberProfileCreate(MemberProfileBase):
    pass

class MemberProfileResponse(MemberProfileBase):
    id: int
    member_id: str
    extraction_date: datetime
    class Config:
        from_attributes = True

# --- Member Schemas ---
class MemberBase(BaseModel):
    member_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str
    city: Optional[str] = None
    country: Optional[str] = None
    raw_country: Optional[str] = None
    professional_category: Optional[str] = None
    master_trainer_status: bool = False
    expiry_date: Optional[str] = None
    profile_url: Optional[str] = None
    source_provenance: str = "EREPS Official Directory"
    permission_basis: str = "Legitimate Interest / Public Directory / Authorized Partner Feed"

class MemberCreate(MemberBase):
    qualifications: Optional[List[QualificationCreate]] = []
    profile: Optional[MemberProfileCreate] = None
    links: Optional[List[MemberLinkCreate]] = []

class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    professional_category: Optional[str] = None
    master_trainer_status: Optional[bool] = None
    expiry_date: Optional[str] = None
    profile_url: Optional[str] = None

class MemberDetailResponse(MemberBase):
    is_active: bool
    created_at: datetime
    updated_at: datetime
    qualifications: List[QualificationResponse] = []
    profile: Optional[MemberProfileResponse] = None
    links: List[MemberLinkResponse] = []
    class Config:
        from_attributes = True

class MemberListResponse(BaseModel):
    items: List[MemberDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# --- Extraction Job Schemas ---
class JobCreate(BaseModel):
    job_type: str = "combined" # listing, profile, combined, mock_50, scale_150k
    batch_size: int = 50
    rate_limit_per_min: int = 30
    authorized_token: Optional[str] = None

class ExtractionLogResponse(BaseModel):
    id: int
    job_id: str
    member_id: Optional[str] = None
    log_level: str
    message: str
    error_details: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True

class FailedRecordResponse(BaseModel):
    id: int
    job_id: str
    member_id: Optional[str] = None
    record_identifier: str
    stage: str
    error_reason: str
    raw_payload: Optional[str] = None
    retry_count: int
    last_retry_at: Optional[datetime] = None
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ExtractionJobResponse(BaseModel):
    id: str
    job_name: str
    job_type: str
    status: str
    total_records: int
    processed_records: int
    successful_records: int
    failed_records: int
    duplicate_records: int
    current_page: int
    rate_limit_per_min: int
    batch_size: int
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- Analytics Schemas ---
class OverviewStats(BaseModel):
    total_members: int
    profiles_processed: int
    pending_profiles: int
    members_with_websites: int
    members_with_social: int
    failed_records: int
    duplicate_records: int
    success_percentage: float
    total_qualifications: int
    total_links: int

class DistributionItem(BaseModel):
    label: str
    count: int
    percentage: float

class AnalyticsResponse(BaseModel):
    overview: OverviewStats
    country_distribution: List[DistributionItem]
    qualification_distribution: List[DistributionItem]
    platform_distribution: List[DistributionItem]
    missing_fields_stats: Dict[str, int]
    performance_metrics: Dict[str, Any]

# --- Audit & Quality ---
class ManualCorrectionRequest(BaseModel):
    field_name: str
    new_value: Any
    correction_reason: str

class GDPRErasureRequest(BaseModel):
    member_id: str
    requestor_email: str
    reason: str
