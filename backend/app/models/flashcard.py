from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database.session import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=True)
    card_type = Column(String, default="concept")  # definition, concept, formula, comparison, example, q_a
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    
    # SuperMemo SM-2 Spaced Repetition Fields
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)
    repetitions = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, nullable=True)
    next_review_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="flashcards")
    topic = relationship("Topic", back_populates="flashcards")
    reviews = relationship("FlashcardReview", back_populates="flashcard", cascade="all, delete-orphan")


class FlashcardReview(Base):
    __tablename__ = "flashcard_reviews"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(String, nullable=False)  # again, hard, good, easy
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    flashcard = relationship("Flashcard", back_populates="reviews")
