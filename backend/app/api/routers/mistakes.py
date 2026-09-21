from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.mastery import Mistake
from app.schemas.mastery import MistakeResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/mistakes", tags=["Mistake Memory"])

@router.get("/course/{course_id}", response_model=List[MistakeResponse])
def get_user_mistakes(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mistakes = db.query(Mistake).filter(Mistake.user_id == current_user.id).all()
    results = []
    for m in mistakes:
        results.append(
            MistakeResponse(
                id=m.id,
                topic_id=m.topic_id,
                topic_name=m.topic.name if m.topic else "General Concept",
                question_text=m.question_text,
                student_answer=m.student_answer,
                correct_answer=m.correct_answer,
                mistake_type=m.mistake_type,
                resolution_status=m.resolution_status,
                occurrences=m.occurrences,
                last_occurred_at=m.last_occurred_at
            )
        )
    return results

@router.post("/{mistake_id}/resolve", response_model=MistakeResponse)
def resolve_mistake(
    mistake_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    m = db.query(Mistake).filter(Mistake.id == mistake_id, Mistake.user_id == current_user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mistake not found")

    m.resolution_status = "resolved"
    db.commit()
    db.refresh(m)

    return MistakeResponse(
        id=m.id,
        topic_id=m.topic_id,
        topic_name=m.topic.name if m.topic else "General Concept",
        question_text=m.question_text,
        student_answer=m.student_answer,
        correct_answer=m.correct_answer,
        mistake_type=m.mistake_type,
        resolution_status=m.resolution_status,
        occurrences=m.occurrences,
        last_occurred_at=m.last_occurred_at
    )
