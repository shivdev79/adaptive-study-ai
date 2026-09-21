from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, default="Personalized Learning Plan")
    plan_mode = Column(String, default="standard")  # standard, crash_mode
    total_hours_scheduled = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="study_plans")
    sessions = relationship("StudySession", back_populates="study_plan", cascade="all, delete-orphan")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    study_plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=True)
    session_title = Column(String, nullable=False)
    activity_type = Column(String, default="study")  # study, quiz, flashcard_revision, pyq_practice
    scheduled_start = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=45)
    is_completed = Column(Boolean, default=False)
    priority_level = Column(String, default="high")  # high, medium, low

    study_plan = relationship("StudyPlan", back_populates="sessions")
    topic = relationship("Topic")
