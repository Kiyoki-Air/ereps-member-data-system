import os
import shutil
from pydantic_settings import BaseSettings
from typing import List

_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
_IS_VERCEL = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))


def _resolve_default_database_url() -> str:
    env_db = os.getenv("DATABASE_URL")
    if env_db:
        return env_db
    bundled_db = os.path.join(_ROOT_DIR, "ereps.db")
    if _IS_VERCEL:
        tmp_db = "/tmp/ereps.db"
        if os.path.exists(bundled_db) and not os.path.exists(tmp_db):
            shutil.copy2(bundled_db, tmp_db)
        return f"sqlite:///{tmp_db}"
    if os.path.exists(bundled_db):
        return f"sqlite:///{bundled_db}"
    return "sqlite:///./ereps.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "EREPS Member Data Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    # Defaults to PostgreSQL, but falls back seamlessly to SQLite if PostgreSQL service is unavailable locally
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "ereps_db")
    
    DATABASE_URL: str = _resolve_default_database_url()
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ereps-super-secret-production-encryption-key-2026-secure")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALGORITHM: str = "HS256"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Extraction Config
    DEFAULT_BATCH_SIZE: int = 50
    DEFAULT_RATE_LIMIT_PER_MIN: int = 30  # Polite, non-aggressive requests
    DATA_DIR: str = os.getenv("DATA_DIR", "/tmp/data" if _IS_VERCEL else "./data")
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "/tmp/data/exports" if _IS_VERCEL else "./data/exports")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
