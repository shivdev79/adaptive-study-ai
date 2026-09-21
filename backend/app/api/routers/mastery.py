from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.knowledge import Topic
from app.models.mastery import MasteryScore
from app.schemas.mastery import MasteryScoreResponse, WeakTopicResponse
from app.core.security import get_current_user
from app.services.mastery_service import mastery_service

router = APIRouter(prefix="/mastery", tags=["Mastery Engine"])

@router.get("/course/{course_id}", response_model=List[MasteryScoreResponse])
def get_course_mastery_scores(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = db.query(Topic).filter(Topic.course_id == course_id).all()
    results = []
    for t in topics:
        m = mastery_service.calculate_topic_mastery(db, current_user.id, course_id, t.id)
        results.append(
            MasteryScoreResponse(
                id=m.id,
                topic_id=t.id,
                topic_name=t.name,
                score=m.score,
                confidence=m.confidence,
                attempts_count=m.attempts_count,
                correct_count=m.correct_count,
                last_studied_at=m.last_studied_at,
                explanation=m.explanation or {}
            )
        )
    return results

@router.get("/weak/{course_id}", response_model=List[WeakTopicResponse])
def get_weak_topics(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = db.query(Topic).filter(Topic.course_id == course_id).all()
    weak_items = []
    for t in topics:
        m = mastery_service.calculate_topic_mastery(db, current_user.id, course_id, t.id)
        if m.score < 70.0:
            weak_items.append(
                WeakTopicResponse(
                    topic_id=t.id,
                    topic_name=t.name,
                    mastery_score=m.score,
                    reason=f"Current score is {m.score}%. {m.explanation.get('summary', '')}",
                    recommendation=f"Review foundational concepts in '{t.name}' and attempt a targeted diagnostic quiz."
                )
            )
    weak_items.sort(key=lambda x: x.mastery_score)
    return weak_items
