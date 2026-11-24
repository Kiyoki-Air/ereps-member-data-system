import os
import pytest
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.models.member import Member, MemberProfile, MemberLink, Qualification, ExtractionJob, FailedRecord
from backend.app.services.link_extractor import LinkExtractorEngine
from backend.app.services.data_quality import DataQualityEngine
from backend.app.services.export_service import ExportService
from backend.app.services.extraction_engine import ExtractionEngine

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_link_extractor_platforms():
    """Test dedicated classification across all 8 required platforms and tracking parameter stripping."""
    # Instagram
    p, t, c = LinkExtractorEngine.classify_link("https://www.instagram.com/johndoe_pt/?utm_source=ig_web&igshid=xyz123")
    assert p == "instagram"
    assert t == "social"
    assert "utm_source" not in c
    assert "igshid" not in c
    assert c == "https://www.instagram.com/johndoe_pt"

    # LinkedIn
    p, t, c = LinkExtractorEngine.classify_link("https://uk.linkedin.com/in/sarah-fitness-coach?ref=feed")
    assert p == "linkedin"
    assert t == "social"
    assert "ref" not in c

    # Facebook
    p, t, c = LinkExtractorEngine.classify_link("https://facebook.com/elitefitness.trainer")
    assert p == "facebook"
    assert t == "social"

    # YouTube
    p, t, c = LinkExtractorEngine.classify_link("https://youtube.com/@marcomovement?si=998877")
    assert p == "youtube"
    assert t == "social"
    assert "si" not in c

    # Twitter / X
    p, t, c = LinkExtractorEngine.classify_link("https://x.com/coach_alex")
    assert p == "twitter_x"
    assert t == "social"

    # TikTok
    p, t, c = LinkExtractorEngine.classify_link("https://www.tiktok.com/@functional_fit")
    assert p == "tiktok"
    assert t == "social"

    # Business website
    p, t, c = LinkExtractorEngine.classify_link("https://www.berlin-fitness-studio.de")
    assert p == "business_website"
    assert t == "website"

    # Personal website
    p, t, c = LinkExtractorEngine.classify_link("https://www.alexandermueller.com/about")
    assert p == "personal_website"
    assert t == "website"

def test_data_quality_standardization():
    """Test country standardisation, date parsing, and unicode preservation."""
    # Country canonicalization
    norm, raw = DataQualityEngine.standardize_country("Deutschland")
    assert norm == "Germany"
    assert raw == "Deutschland"

    norm, raw = DataQualityEngine.standardize_country("UK")
    assert norm == "United Kingdom"

    norm, raw = DataQualityEngine.standardize_country("España")
    assert norm == "Spain"

    # Date normalization
    assert DataQualityEngine.standardize_date("31/12/2026") == "2026-12-31"
    assert DataQualityEngine.standardize_date("2027-05-15") == "2027-05-15"
    assert DataQualityEngine.standardize_date("15 Oct 2028") == "2028-10-15"

    # Unicode preservation
    cleaned = DataQualityEngine.clean_text("  Björn    Müller  -  Łódź   ")
    assert cleaned == "Björn Müller - Łódź"

    # Member ID validation
    valid, cid = DataQualityEngine.validate_member_id("#133197")
    assert valid is True
    assert cid == "133197"

def test_database_and_mock_generation(db):
    """Test creating mock dataset of 50 records and verify relational integrity."""
    job = ExtractionEngine.create_job(db, job_type="mock_50", batch_size=50)
    assert job.id.startswith("JOB-")

    res = ExtractionEngine.run_mock_50_dataset(db, job.id)
    assert res["status"] == "completed"
    # Either successful new records or recognized duplicates should account for the batch
    assert (res["successful"] + res["duplicates"]) >= 45

    # Verify members created in DB
    count = db.query(Member).count()
    assert count >= 45

    # Check relational profiles and links
    sample_member = db.query(Member).first()
    assert sample_member is not None
    assert sample_member.profile is not None
    assert len(sample_member.qualifications) > 0

def test_excel_export_multi_sheets(db):
    """Test OpenPyXL multi-sheet workbook generation."""
    filepath = ExportService.generate_excel_workbook(db)
    assert os.path.exists(filepath)
    assert filepath.endswith(".xlsx")

    # Verify sheets with openpyxl
    import openpyxl
    wb = openpyxl.load_workbook(filepath)
    expected_sheets = ["ALL MEMBERS", "MEMBER PROFILES", "SOCIAL MEDIA LINKS", "WEBSITES", "EXTRACTION LOGS"]
    for s in expected_sheets:
        assert s in wb.sheetnames

def test_retry_failed_records(db):
    """Test retry pipeline for failed records."""
    jobs = db.query(ExtractionJob).all()
    if jobs:
        target_job = jobs[0]
        retry_res = ExtractionEngine.retry_failed_records(db, target_job.id)
        assert "retried" in retry_res
