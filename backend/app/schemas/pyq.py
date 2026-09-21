from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PYQQuestionResponse(BaseModel):
    id: int
    course_id: int
    topic_id: Optional[int] = None
    topic_name: Optional[str] = None
    year: int
    exam_name: str
    question_text: str
    marks: int
    difficulty: str
    question_type: str
    occurrences_count: int

    class Config:
        from_attributes = True

class TopicFrequencyResponse(BaseModel):
    topic_id: int
    topic_name: str
    occurrences: int
    percentage: float

class PYQAnalysisOverviewResponse(BaseModel):
    course_id: int
    course_name: str
    frequently_asked_topics: List[str]
    repeated_concepts: List[str]
    question_patterns: List[str]
    difficulty_patterns: str
    pyqs: List[PYQQuestionResponse]
    topic_frequencies: List[TopicFrequencyResponse]
