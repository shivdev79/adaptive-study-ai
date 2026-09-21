from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL

# Handle sqlite specific arguments
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args)
except Exception as e:
    logger.warning(f"Failed to connect using DATABASE_URL={db_url}, falling back to SQLite: {e}")
    db_url = "sqlite:///./studymind.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
