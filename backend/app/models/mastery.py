from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class MasteryScore(Base):
    __tablename__ = "mastery_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, default=0.0)  # 0.0 to 100.0
    confidence = Column(Float, default=50.0)
    attempts_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    last_studied_at = Column(DateTime, nullable=True)
    last_tested_at = Column(DateTime, nullable=True)
    explanation = Column(JSON, default=dict)  # Breakdown of accuracy, recency, difficulty adjustments
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    course = relationship("Course", back_populates="mastery_scores")
    topic = relationship("Topic", back_populates="mastery_scores")


class Mistake(Base):
    __tablename__ = "mistakes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    mistake_type = Column(String, default="conceptual")  # conceptual, calculation, misreading, formula
    resolution_status = Column(String, default="needs_revision")  # needs_revision, reviewing, resolved
    occurrences = Column(Integer, default=1)
    last_occurred_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic")
