from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    importance_weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="topics")
    concepts = relationship("Concept", back_populates="topic", cascade="all, delete-orphan")
    mastery_scores = relationship("MasteryScore", back_populates="topic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="topic", cascade="all, delete-orphan")
    pyq_questions = relationship("PYQQuestion", back_populates="topic", cascade="all, delete-orphan")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    difficulty = Column(String, default="Medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="concepts")


class TopicRelationship(Base):
    __tablename__ = "topic_relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    target_topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String, default="prerequisite")  # prerequisite, parent_child, related
