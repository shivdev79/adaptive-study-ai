from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MasteryScoreResponse(BaseModel):
    id: int
    topic_id: int
    topic_name: str
    score: float
    confidence: float
    attempts_count: int
    correct_count: int
    last_studied_at: Optional[datetime] = None
    explanation: Dict[str, Any]

    class Config:
        from_attributes = True

class WeakTopicResponse(BaseModel):
    topic_id: int
    topic_name: str
    mastery_score: float
    reason: str
    recommendation: str

class MistakeResponse(BaseModel):
    id: int
    topic_id: int
    topic_name: str
    question_text: str
    student_answer: str
    correct_answer: str
    mistake_type: str
    resolution_status: str
    occurrences: int
    last_occurred_at: datetime

    class Config:
        from_attributes = True
