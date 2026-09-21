from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.core.security import get_current_user
from app.services.summary_service import summary_service

router = APIRouter(prefix="/summary", tags=["PPT & Document Summaries"])

@router.get("/document/{document_id}")
def get_document_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document #{document_id} not found")
    
    return summary_service.generate_document_summary(db, document_id)

@router.get("/course/{course_id}")
def get_course_summary(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    doc = db.query(Document).filter(Document.course_id == course_id).order_by(Document.id.desc()).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"No uploaded document found for course #{course_id}")
    
    return summary_service.generate_document_summary(db, doc.id)
