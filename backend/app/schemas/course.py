from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CourseCreate(BaseModel):
    name: str
    subject: str
    description: Optional[str] = None
    exam_date: Optional[datetime] = None
    target_score: Optional[float] = 90.0
    daily_study_time_minutes: Optional[int] = 120
    difficulty: Optional[str] = "Medium"
    semester: Optional[str] = None

class CourseResponse(BaseModel):
    id: int
    user_id: int
    name: str
    subject: str
    description: Optional[str] = None
    exam_date: Optional[datetime] = None
    target_score: float
    daily_study_time_minutes: int
    difficulty: str
    semester: Optional[str] = None
    created_at: datetime
    document_count: Optional[int] = 0
    topic_count: Optional[int] = 0
    overall_mastery: Optional[float] = 0.0

    class Config:
        from_attributes = True
