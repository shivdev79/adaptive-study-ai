from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FlashcardResponse(BaseModel):
    id: int
    course_id: int
    topic_id: Optional[int] = None
    topic_name: Optional[str] = None
    card_type: str
    front: str
    back: str
    interval_days: int
    repetitions: int
    next_review_at: datetime

    class Config:
        from_attributes = True

class FlashcardReviewRequest(BaseModel):
    rating: str  # again, hard, good, easy

class FlashcardGenerateRequest(BaseModel):
    course_id: int
    topic_id: Optional[int] = None
    count: Optional[int] = 5
