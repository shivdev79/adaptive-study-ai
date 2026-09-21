from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    question_type = Column(String, default="mcq")  # mcq, true_false, short_answer, long_answer, numerical, coding
    difficulty = Column(String, default="medium")  # easy, medium, hard
    prompt = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # List of options for MCQ
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    source_chunk_id = Column(Integer, ForeignKey("document_chunks.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="questions")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    quiz_type = Column(String, default="adaptive")  # diagnostic, adaptive, topic_specific, exam_mode
    total_questions = Column(Integer, default=5)
    time_limit_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score_percentage = Column(Float, default=0.0)
    time_taken_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("Answer", back_populates="attempt", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    student_response = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    score = Column(Float, default=0.0)
    feedback = Column(Text, nullable=True)
    missing_concepts = Column(JSON, default=list)
    model_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("Question")
