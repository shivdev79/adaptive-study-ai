from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardResponse, FlashcardReviewRequest, FlashcardGenerateRequest
from app.core.security import get_current_user
from app.services.spaced_repetition_service import spaced_repetition_service

router = APIRouter(prefix="/flashcards", tags=["Flashcards & Spaced Repetition"])

@router.get("/due/course/{course_id}", response_model=List[FlashcardResponse])
def get_due_flashcards(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cards = db.query(Flashcard).filter(
        Flashcard.course_id == course_id,
        Flashcard.next_review_at <= datetime.utcnow()
    ).all()

    # If no cards are strictly due, return all course flashcards for review
    if not cards:
        cards = db.query(Flashcard).filter(Flashcard.course_id == course_id).all()

    results = []
    for c in cards:
        results.append(
            FlashcardResponse(
                id=c.id,
                course_id=c.course_id,
                topic_id=c.topic_id,
                topic_name=c.topic.name if c.topic else "General Concept",
                card_type=c.card_type,
                front=c.front,
                back=c.back,
                interval_days=c.interval_days,
                repetitions=c.repetitions,
                next_review_at=c.next_review_at
            )
        )
    return results

@router.post("/{flashcard_id}/review", response_model=FlashcardResponse)
def review_flashcard(
    flashcard_id: int,
    req: FlashcardReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = spaced_repetition_service.process_review(db, current_user.id, flashcard_id, req.rating)
    return FlashcardResponse(
        id=updated.id,
        course_id=updated.course_id,
        topic_id=updated.topic_id,
        topic_name=updated.topic.name if updated.topic else "General Concept",
        card_type=updated.card_type,
        front=updated.front,
        back=updated.back,
        interval_days=updated.interval_days,
        repetitions=updated.repetitions,
        next_review_at=updated.next_review_at
    )

@router.post("/generate", response_model=List[FlashcardResponse])
def generate_flashcards(
    req: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.knowledge import Topic
    topics = db.query(Topic).filter(Topic.course_id == req.course_id).all()

    new_cards = []
    if topics:
        for idx, t in enumerate(topics[:req.count or 5]):
            c1 = Flashcard(
                course_id=req.course_id,
                topic_id=t.id,
                card_type="concept",
                front=f"Core Concept: {t.name}",
                back=f"Key principle: {t.description or 'Foundational module grounded in uploaded course notes.'}",
                next_review_at=datetime.utcnow()
            )
            c2 = Flashcard(
                course_id=req.course_id,
                topic_id=t.id,
                card_type="formula",
                front=f"Governing Formulation: {t.name}",
                back=f"Mathematical constraint: Ensure systematic evaluation of {t.name} parameters.",
                next_review_at=datetime.utcnow()
            )
            db.add(c1)
            db.add(c2)
            new_cards.extend([c1, c2])
    else:
        # Fallback card
        card = Flashcard(
            course_id=req.course_id,
            topic_id=req.topic_id,
            card_type="concept",
            front="Primary Course Principle",
            back="Grounding concepts extracted from uploaded study materials.",
            next_review_at=datetime.utcnow()
        )
        db.add(card)
        new_cards.append(card)

    db.commit()
    for c in new_cards:
        db.refresh(c)

    return [
        FlashcardResponse(
            id=c.id,
            course_id=c.course_id,
            topic_id=c.topic_id,
            topic_name=c.topic.name if c.topic else "General Concept",
            card_type=c.card_type,
            front=c.front,
            back=c.back,
            interval_days=c.interval_days,
            repetitions=c.repetitions,
            next_review_at=c.next_review_at
        ) for c in new_cards
    ]
