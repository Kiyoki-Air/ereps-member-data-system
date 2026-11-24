from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.member import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & Overview"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_analytics(db)
