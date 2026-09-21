from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Citation(BaseModel):
    document_title: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    snippet: str

class ChatRequest(BaseModel):
    course_id: int
    conversation_id: Optional[int] = None
    message: str
    mode: Optional[str] = "exam"  # beginner, exam, deep_learning, interview, quick_revision, socratic

class MessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    citations: List[Citation] = []
    suggested_followups: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    course_id: int
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
