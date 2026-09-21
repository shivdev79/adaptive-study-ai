from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    exam_date = Column(DateTime, nullable=True)
    target_score = Column(Float, default=90.0)
    daily_study_time_minutes = Column(Integer, default=120)
    difficulty = Column(String, default="Medium")  # "Easy", "Medium", "Hard"
    semester = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="courses")
    documents = relationship("Document", back_populates="course", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="course", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="course", cascade="all, delete-orphan")
    mastery_scores = relationship("MasteryScore", back_populates="course", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="course", cascade="all, delete-orphan")
    pyq_questions = relationship("PYQQuestion", back_populates="course", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="course", cascade="all, delete-orphan")
