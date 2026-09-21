from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="student")  # "student", "teacher", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    avatar_url = Column(String, nullable=True)
    institution = Column(String, nullable=True)
    academic_level = Column(String, default="Undergraduate")
    xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_study_date = Column(DateTime, nullable=True)
    target_daily_hours = Column(Float, default=2.0)
    preferences = Column(JSON, default=dict)

    user = relationship("User", back_populates="profile")
