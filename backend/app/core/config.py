import os
from pydantic_settings import BaseSettings
from typing import List

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
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///./ereps.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ereps-super-secret-production-encryption-key-2026-secure")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALGORITHM: str = "HS256"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Extraction Config
    DEFAULT_BATCH_SIZE: int = 50
    DEFAULT_RATE_LIMIT_PER_MIN: int = 30  # Polite, non-aggressive requests
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "./data/exports")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
