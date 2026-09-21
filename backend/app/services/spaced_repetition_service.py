from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.flashcard import Flashcard, FlashcardReview

class SpacedRepetitionService:
    def process_review(self, db: Session, user_id: int, flashcard_id: int, rating: str) -> Flashcard:
        card = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
        if not card:
            raise ValueError("Flashcard not found")

        # Map rating string to numeric grade q (0 to 5)
        # again: 0, hard: 3, good: 4, easy: 5
        rating_map = {
            "again": 0,
            "hard": 3,
            "good": 4,
            "easy": 5
        }
        q = rating_map.get(rating.lower(), 4)

        review = FlashcardReview(
            flashcard_id=card.id,
            user_id=user_id,
            rating=rating.lower()
        )
        db.add(review)

        # SuperMemo SM-2 Algorithm Implementation
        if q >= 3:
            if card.repetitions == 0:
                card.interval_days = 1
            elif card.repetitions == 1:
                card.interval_days = 6
            else:
                card.interval_days = int(round(card.interval_days * card.ease_factor))
            card.repetitions += 1
        else:
            card.repetitions = 0
            card.interval_days = 1

        # Ease factor formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_ef = card.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        card.ease_factor = max(1.3, round(new_ef, 2))

        card.last_reviewed_at = datetime.utcnow()
        card.next_review_at = datetime.utcnow() + timedelta(days=card.interval_days)

        db.commit()
        db.refresh(card)
        return card

spaced_repetition_service = SpacedRepetitionService()
