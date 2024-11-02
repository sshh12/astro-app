from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Astro App"
    SECRET_KEY: str = secrets.token_urlsafe(32)

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "astronomy_db"
    SQLALCHEMY_DATABASE_URI: str = (
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
    )

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",  # React frontend
        "http://localhost:8000",  # FastAPI backend
    ]

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True


settings = Settings()
