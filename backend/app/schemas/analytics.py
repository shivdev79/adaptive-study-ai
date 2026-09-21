from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ReadinessComponent(BaseModel):
    name: str
    score: float
    description: str

class ReadinessResponse(BaseModel):
    overall_readiness: float
    status: str  # Excellent, Good, Needs Focus, Critical
    components: List[ReadinessComponent]

class DashboardSummaryResponse(BaseModel):
    user_name: str
    greeting: str
    current_course_id: Optional[int] = None
    current_course_name: Optional[str] = None
    overall_mastery: float
    exam_readiness: float
    streak_days: int
    flashcards_due_today: int
    weak_topics_count: int
    next_recommended_activity: str
    next_recommended_topic: str
