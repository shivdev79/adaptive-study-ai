from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.mastery import MasteryScore, Mistake
from app.models.quiz import Answer, Question, QuizAttempt, Quiz
from app.models.knowledge import Topic

class MasteryService:
    def calculate_topic_mastery(self, db: Session, user_id: int, course_id: int, topic_id: int) -> MasteryScore:
        mastery = db.query(MasteryScore).filter(
            MasteryScore.user_id == user_id,
            MasteryScore.course_id == course_id,
            MasteryScore.topic_id == topic_id
        ).first()

        if not mastery:
            mastery = MasteryScore(
                user_id=user_id,
                course_id=course_id,
                topic_id=topic_id,
                score=0.0,
                confidence=50.0,
                attempts_count=0,
                correct_count=0,
                explanation={}
            )
            db.add(mastery)
            db.commit()

        # Query all answers for this topic
        answers = (
            db.query(Answer)
            .join(QuizAttempt, Answer.attempt_id == QuizAttempt.id)
            .join(Question, Answer.question_id == Question.id)
            .filter(QuizAttempt.user_id == user_id, Question.topic_id == topic_id)
            .all()
        )

        if not answers:
            mastery.score = 50.0  # Default initial baseline
            mastery.explanation = {
                "base_score": 50.0,
                "accuracy": "No quizzes taken yet",
                "recency_factor": 1.0,
                "difficulty_adjustment": 0,
                "repeated_mistakes_penalty": 0,
                "summary": "Initial baseline score. Complete a quiz to update your score."
            }
            db.commit()
            return mastery

        attempts_count = len(answers)
        correct_count = sum(1 for a in answers if a.is_correct)
        raw_accuracy = (correct_count / attempts_count) * 100.0

        # Difficulty weighted bonus
        difficulty_bonus = 0.0
        for a in answers:
            if a.is_correct:
                if a.question.difficulty == "hard":
                    difficulty_bonus += 5.0
                elif a.question.difficulty == "medium":
                    difficulty_bonus += 2.0

        # Recency decay (penalty if last tested over 7 days ago)
        latest_answer = max(answers, key=lambda x: x.created_at)
        days_since = (datetime.utcnow() - latest_answer.created_at).days
        recency_penalty = min(days_since * 1.5, 15.0)

        # Repeated mistakes penalty
        unresolved_mistakes = db.query(Mistake).filter(
            Mistake.user_id == user_id,
            Mistake.topic_id == topic_id,
            Mistake.resolution_status != "resolved"
        ).count()

        mistakes_penalty = unresolved_mistakes * 4.0

        # Calculate final explainable score bounded [0, 100]
        final_score = max(0.0, min(100.0, raw_accuracy + difficulty_bonus - recency_penalty - mistakes_penalty))

        mastery.score = round(final_score, 1)
        mastery.attempts_count = attempts_count
        mastery.correct_count = correct_count
        mastery.last_tested_at = latest_answer.created_at
        mastery.explanation = {
            "accuracy_percent": round(raw_accuracy, 1),
            "difficulty_bonus": round(difficulty_bonus, 1),
            "days_since_last_test": days_since,
            "recency_penalty": round(recency_penalty, 1),
            "unresolved_mistakes_count": unresolved_mistakes,
            "mistakes_penalty": round(mistakes_penalty, 1),
            "summary": f"Accuracy {round(raw_accuracy, 1)}% adjusted for difficulty (+{round(difficulty_bonus, 1)}) and recency (-{round(recency_penalty, 1)})."
        }

        db.commit()
        return mastery

mastery_service = MasteryService()
