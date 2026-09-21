from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    course_id: int
    title: str
    file_type: str
    file_size_bytes: int
    status: str
    error_message: Optional[str] = None
    doc_metadata: Optional[Dict[str, Any]] = None
    chunk_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    chunk_index: int
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
