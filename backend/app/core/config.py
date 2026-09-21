import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StudyMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key & Auth
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-studymind-ai-2026-production-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./studymind.db")

    # AI Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")  # groq, openai, huggingface, mock
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./vector_store")

    # CORS
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
