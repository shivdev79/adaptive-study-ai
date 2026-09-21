from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, default="Tutor Chat")
    mode = Column(String, default="exam")  # beginner, exam, deep_learning, interview, quick_revision, socratic
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    course = relationship("Course", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False)  # "user", "assistant"
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)  # Source document titles, page numbers, chunks
    suggested_followups = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
