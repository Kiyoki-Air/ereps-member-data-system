import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.security import hash_password
from backend.app.models.member import User, DataSource, Member
from backend.app.services.extraction_engine import ExtractionEngine

# Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.members import router as members_router
from backend.app.api.links import router as links_router
from backend.app.api.extraction import router as extraction_router
from backend.app.api.export import router as export_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.governance import router as governance_router

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade EREPS Member Directory Data Extraction, Governance, and Management System."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(members_router, prefix=settings.API_V1_STR)
app.include_router(links_router, prefix=settings.API_V1_STR)
app.include_router(extraction_router, prefix=settings.API_V1_STR)
app.include_router(export_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(governance_router, prefix=settings.API_V1_STR)

# Serve Frontend static build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.on_event("startup")
def init_application_state():
    """Seed initial administrator account, default data sources, and sample mock data if empty."""
    db = SessionLocal()
    try:
        # 1. Initialize Admin User
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@ereps-manager.local",
                hashed_password=hash_password("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()

        # 2. Initialize Data Sources
        ds = db.query(DataSource).filter(DataSource.name == "EREPS Web Directory").first()
        if not ds:
            ds = DataSource(
                name="EREPS Web Directory",
                base_url="https://www.ereps.eu/member-directory",
                access_method="web_directory",
                auth_required=True,
                permission_status="pending_review",
                rate_limit_req_per_sec=0.5,
                terms_notes="EuropeActive Terms of Use apply. Live extraction requires confirmed authorization."
            )
            db.add(ds)
            db.commit()

        # 3. Seed 50 Mock Records if database has zero members
        count = db.query(Member).count()
        if count == 0:
            job = ExtractionEngine.create_job(db, job_type="mock_50", batch_size=50)
            ExtractionEngine.run_mock_50_dataset(db, job.id)

    finally:
        db.close()

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

@app.get("/", tags=["Root"])
def root():
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": "Welcome to EREPS Member Data Management System API",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

