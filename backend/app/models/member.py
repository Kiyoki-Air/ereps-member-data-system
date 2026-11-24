import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Index, Float, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class Member(Base):
    __tablename__ = "members"

    member_id = Column(String(64), primary_key=True, index=True) # Unique confirmed membership ID
    first_name = Column(String(128), nullable=True)
    last_name = Column(String(128), nullable=True)
    full_name = Column(String(256), nullable=False, index=True)
    city = Column(String(128), nullable=True, index=True)
    country = Column(String(128), nullable=True, index=True)
    raw_country = Column(String(128), nullable=True)
    professional_category = Column(String(128), nullable=True, index=True) # e.g. Personal Trainer, Group Fitness Instructor
    master_trainer_status = Column(Boolean, default=False)
    expiry_date = Column(String(64), nullable=True) # Date string or standardized ISO date
    profile_url = Column(String(512), nullable=True)
    source_provenance = Column(String(128), default="EREPS Official Directory")
    permission_basis = Column(String(128), default="Legitimate Interest / Public Directory / Authorized Partner Feed")
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    qualifications = relationship("Qualification", back_populates="member", cascade="all, delete-orphan")
    profile = relationship("MemberProfile", back_populates="member", uselist=False, cascade="all, delete-orphan")
    links = relationship("MemberLink", back_populates="member", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_member_search", "full_name", "country", "city"),
    )

class Qualification(Base):
    __tablename__ = "qualifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(String(64), ForeignKey("members.member_id", ondelete="CASCADE"), nullable=False, index=True)
    qualification_name = Column(String(256), nullable=False, index=True)
    eqf_level = Column(String(32), nullable=True) # e.g., "EQF Level 4", "Level 3"
    discipline = Column(String(128), nullable=True)
    awarding_body = Column(String(256), nullable=True)
    expiry_date = Column(String(64), nullable=True)
    is_master_trainer = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    member = relationship("Member", back_populates="qualifications")

class MemberProfile(Base):
    __tablename__ = "member_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(String(64), ForeignKey("members.member_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    specialties = Column(Text, nullable=True) # Comma-separated or bullet list
    certifications_text = Column(Text, nullable=True)
    business_name = Column(String(256), nullable=True)
    business_phone = Column(String(64), nullable=True)
    business_email = Column(String(128), nullable=True)
    business_address = Column(String(256), nullable=True)
    original_profile_url = Column(String(512), nullable=True)
    extraction_date = Column(DateTime(timezone=True), default=utcnow)
    source_status = Column(String(64), default="extracted") # extracted, missing, pending, failed
    missing_fields = Column(Text, nullable=True) # JSON or comma list of missing fields

    member = relationship("Member", back_populates="profile")

class MemberLink(Base):
    __tablename__ = "member_links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(String(64), ForeignKey("members.member_id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(64), nullable=False, index=True) # instagram, linkedin, facebook, youtube, twitter_x, tiktok, personal_website, business_website, other
    original_url = Column(String(1024), nullable=False)
    clean_url = Column(String(1024), nullable=False)
    link_type = Column(String(64), default="social") # social, website, portfolio, directory
    is_verified = Column(Boolean, default=True)
    last_checked = Column(DateTime(timezone=True), default=utcnow)
    source_profile_url = Column(String(512), nullable=True)

    member = relationship("Member", back_populates="links")

class ExtractionJob(Base):
    __tablename__ = "extraction_jobs"

    id = Column(String(64), primary_key=True, index=True)
    job_name = Column(String(256), nullable=False)
    job_type = Column(String(64), nullable=False) # listing, profile, combined, retry, mock_50, scale_150k
    status = Column(String(64), default="pending", index=True) # pending, running, paused, completed, failed, cancelled
    total_records = Column(Integer, default=0)
    processed_records = Column(Integer, default=0)
    successful_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    duplicate_records = Column(Integer, default=0)
    current_page = Column(Integer, default=0)
    checkpoint_data = Column(JSON, nullable=True)
    rate_limit_per_min = Column(Integer, default=30)
    batch_size = Column(Integer, default=50)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    logs = relationship("ExtractionLog", back_populates="job", cascade="all, delete-orphan")
    failures = relationship("FailedRecord", back_populates="job", cascade="all, delete-orphan")

class ExtractionLog(Base):
    __tablename__ = "extraction_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(64), ForeignKey("extraction_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(String(64), nullable=True)
    log_level = Column(String(32), default="INFO") # INFO, WARNING, ERROR, SUCCESS
    message = Column(Text, nullable=False)
    error_details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)

    job = relationship("ExtractionJob", back_populates="logs")

class FailedRecord(Base):
    __tablename__ = "failed_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(64), ForeignKey("extraction_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(String(64), nullable=True, index=True)
    record_identifier = Column(String(256), nullable=False)
    stage = Column(String(64), nullable=False) # listing, profile, link_parsing, validation
    error_reason = Column(Text, nullable=False)
    raw_payload = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    last_retry_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), default="unresolved") # unresolved, retrying, resolved, abandoned
    created_at = Column(DateTime(timezone=True), default=utcnow)

    job = relationship("ExtractionJob", back_populates="failures")

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(128), unique=True, nullable=False)
    base_url = Column(String(512), nullable=False)
    access_method = Column(String(64), nullable=False) # api, web_directory, csv_import
    auth_required = Column(Boolean, default=False)
    permission_status = Column(String(64), default="pending_review") # approved, pending_review, restricted
    rate_limit_req_per_sec = Column(Float, default=0.5)
    terms_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=True)
    action = Column(String(64), nullable=False) # create, update, delete, gdpr_erasure, export, import
    entity_type = Column(String(64), nullable=False) # member, profile, link, extraction_job
    entity_id = Column(String(64), nullable=False)
    changes = Column(JSON, nullable=True)
    ip_address = Column(String(64), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(128), unique=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="admin") # admin, operator, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
