from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_key = Column(String, nullable=False)  # first_quiz, 10_quizzes, 7_day_streak, weak_topic_mastered, etc.
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon_name = Column(String, default="Award")
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="reminder")  # flashcards_due, revision_due, streak, mastery_up
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
