from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuizGenerateRequest(BaseModel):
    course_id: int
    topic_ids: Optional[List[int]] = None
    quiz_type: Optional[str] = "adaptive"  # diagnostic, adaptive, topic_specific, exam_mode
    total_questions: Optional[int] = 5
    difficulty: Optional[str] = "medium"  # easy, medium, hard

class QuestionResponse(BaseModel):
    id: int
    question_type: str
    difficulty: str
    prompt: str
    options: Optional[List[str]] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    id: int
    course_id: int
    title: str
    quiz_type: str
    total_questions: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class QuizAnswerSubmit(BaseModel):
    question_id: int
    student_response: str

class QuizSubmitRequest(BaseModel):
    attempt_id: Optional[int] = None
    quiz_id: int
    answers: List[QuizAnswerSubmit]
    time_taken_seconds: Optional[int] = 120

class AnswerFeedbackResponse(BaseModel):
    question_id: int
    student_response: str
    is_correct: bool
    score: float
    feedback: str
    missing_concepts: List[str]
    model_answer: str

class QuizResultResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    score_percentage: float
    total_questions: int
    correct_count: int
    answers_feedback: List[AnswerFeedbackResponse]
