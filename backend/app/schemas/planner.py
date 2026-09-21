from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StudySessionResponse(BaseModel):
    id: int
    topic_id: Optional[int] = None
    topic_name: Optional[str] = None
    session_title: str
    activity_type: str
    scheduled_start: datetime
    duration_minutes: int
    is_completed: bool
    priority_level: str

    class Config:
        from_attributes = True

class StudyPlanResponse(BaseModel):
    id: int
    course_id: int
    title: str
    plan_mode: str
    total_hours_scheduled: float
    created_at: datetime
    sessions: List[StudySessionResponse]

    class Config:
        from_attributes = True

class CrashModeRequest(BaseModel):
    course_id: int
    available_minutes: Optional[int] = 120
