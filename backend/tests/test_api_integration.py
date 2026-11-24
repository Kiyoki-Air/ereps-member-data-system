import pytest
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.api.analytics import get_analytics
from backend.app.api.members import list_members, get_member_detail, manual_record_correction
from backend.app.api.links import list_links
from backend.app.api.export import export_excel_workbook, export_csv_data
from backend.app.api.governance import get_source_inspection_report
from backend.app.schemas.member import ManualCorrectionRequest
from backend.app.models.member import Member, User

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_api_analytics_endpoint(db):
    res = get_analytics(db=db)
    assert res.overview.total_members > 0
    assert len(res.country_distribution) > 0
    assert len(res.qualification_distribution) > 0

def test_api_members_endpoint(db):
    res = list_members(page=1, page_size=10, db=db)
    assert res.total > 0
    assert len(res.items) <= 10

    # Test member detail
    first_id = res.items[0].member_id
    detail = get_member_detail(first_id, db=db)
    assert detail.member_id == first_id

def test_api_manual_correction(db):
    res = list_members(page=1, page_size=1, db=db)
    first_id = res.items[0].member_id
    
    mock_user = User(username="admin", role="admin")
    correction = ManualCorrectionRequest(
        field_name="city",
        new_value="Amsterdam",
        correction_reason="Verified address via registration document"
    )
    updated = manual_record_correction(first_id, correction, db=db, current_user=mock_user)
    assert updated.city == "Amsterdam"

def test_api_links_endpoint(db):
    links = list_links(limit=20, db=db)
    assert isinstance(links, list)

def test_api_inspection_report():
    rep = get_source_inspection_report()
    assert "https://www.ereps.eu/member-directory" in rep["target_url"]
    assert "available_channels" in rep
