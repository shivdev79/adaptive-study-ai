from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.user import User
from app.models.pyq import PYQQuestion
from app.schemas.pyq import PYQQuestionResponse, TopicFrequencyResponse, PYQAnalysisOverviewResponse
from app.core.security import get_current_user
from app.services.pyq_service import pyq_service

router = APIRouter(prefix="/pyq", tags=["PYQ Analyzer"])

@router.get("/analysis/{course_id}", response_model=PYQAnalysisOverviewResponse)
def get_pyq_analysis_overview(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return pyq_service.get_pyq_analysis_overview(db, course_id)

@router.get("/topics/{course_id}", response_model=List[TopicFrequencyResponse])
def get_pyq_topic_frequencies(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    frequencies = pyq_service.get_topic_frequencies(db, course_id)
    return [TopicFrequencyResponse(**f) for f in frequencies]

@router.get("/search/{course_id}", response_model=List[PYQQuestionResponse])
def search_pyq_questions(
    course_id: int,
    query: Optional[str] = None,
    difficulty: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(PYQQuestion).filter(PYQQuestion.course_id == course_id)

    if query:
        q = q.filter(PYQQuestion.question_text.ilike(f"%{query}%"))
    if difficulty:
        q = q.filter(PYQQuestion.difficulty.ilike(difficulty))
    if year:
        q = q.filter(PYQQuestion.year == year)

    pyqs = q.all()
    results = []
    for p in pyqs:
        results.append(
            PYQQuestionResponse(
                id=p.id,
                course_id=p.course_id,
                topic_id=p.topic_id,
                topic_name=p.topic.name if p.topic else "General Concept",
                year=p.year,
                exam_name=p.exam_name,
                question_text=p.question_text,
                marks=p.marks,
                difficulty=p.difficulty,
                question_type=p.question_type,
                occurrences_count=p.occurrences_count
            )
        )
    return results
