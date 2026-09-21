from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class PYQQuestion(Base):
    __tablename__ = "pyq_questions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=True)
    year = Column(Integer, nullable=False)
    exam_name = Column(String, default="Final Exam")
    question_text = Column(Text, nullable=False)
    marks = Column(Integer, default=5)
    difficulty = Column(String, default="Medium")
    question_type = Column(String, default="theoretical")  # theoretical, numerical, diagram, coding
    occurrences_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="pyq_questions")
    topic = relationship("Topic", back_populates="pyq_questions")
