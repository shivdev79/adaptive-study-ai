from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.quiz import Quiz, Question, QuizAttempt, Answer
from app.models.knowledge import Topic
from app.schemas.quiz import (
    QuizGenerateRequest, QuizResponse, QuizSubmitRequest, QuizResultResponse,
    QuestionResponse, AnswerFeedbackResponse
)
from app.core.security import get_current_user
from app.services.quiz_service import quiz_service

router = APIRouter(prefix="/quizzes", tags=["Quiz Engine"])

@router.post("/generate", response_model=QuizResponse)
def generate_quiz(
    req: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = quiz_service.generate_quiz(
        db=db,
        course_id=req.course_id,
        topic_ids=req.topic_ids,
        quiz_type=req.quiz_type or "adaptive",
        total_questions=req.total_questions or 5,
        difficulty=req.difficulty or "medium"
    )

    topics = db.query(Topic).filter(Topic.course_id == req.course_id).all()
    topic_ids = [t.id for t in topics] if topics else []

    questions_query = db.query(Question)
    if topic_ids:
        questions_query = questions_query.filter(Question.topic_id.in_(topic_ids))

    if req.quiz_type in ["mcq", "mcq_only"]:
        questions_query = questions_query.filter(Question.question_type == "mcq")
    elif req.quiz_type in ["descriptive", "short_answer", "long_answer"]:
        questions_query = questions_query.filter(Question.question_type.in_(["short_answer", "long_answer"]))

    questions = questions_query.all()
    
    # Fallback to any course questions if type filter returned empty
    if not questions and topic_ids:
        questions = db.query(Question).filter(Question.topic_id.in_(topic_ids)).all()

    if not questions:
        raise HTTPException(
            status_code=400,
            detail=f"No questions available for course #{req.course_id}. Please upload a study material PDF or PPT file first."
        )

    q_responses = [QuestionResponse.from_orm(q) for q in questions[:req.total_questions or 5]]

    return QuizResponse(
        id=quiz.id,
        course_id=quiz.course_id,
        title=quiz.title,
        quiz_type=quiz.quiz_type,
        total_questions=len(q_responses),
        questions=q_responses
    )

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz_by_id(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    topics = db.query(Topic).filter(Topic.course_id == quiz.course_id).all()
    topic_ids = [t.id for t in topics] if topics else []
    questions = db.query(Question).filter(Question.topic_id.in_(topic_ids)).all() if topic_ids else []
    q_responses = [QuestionResponse.from_orm(q) for q in questions[:quiz.total_questions]]

    return QuizResponse(
        id=quiz.id,
        course_id=quiz.course_id,
        title=quiz.title,
        quiz_type=quiz.quiz_type,
        total_questions=len(q_responses),
        questions=q_responses
    )

@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz_answers(
    quiz_id: int,
    req: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answers_dict = [a.dict() for a in req.answers]
    attempt = quiz_service.evaluate_quiz_submission(
        db=db,
        user_id=current_user.id,
        quiz_id=quiz_id,
        answers_data=answers_dict,
        time_taken=req.time_taken_seconds or 120
    )

    feedback_items = []
    for ans in attempt.answers:
        feedback_items.append(
            AnswerFeedbackResponse(
                question_id=ans.question_id,
                student_response=ans.student_response,
                is_correct=ans.is_correct,
                score=ans.score,
                feedback=ans.feedback or "",
                missing_concepts=ans.missing_concepts or [],
                model_answer=ans.model_answer or ""
            )
        )

    correct_count = sum(1 for a in attempt.answers if a.is_correct)

    return QuizResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz_id,
        score_percentage=attempt.score_percentage,
        total_questions=len(feedback_items),
        correct_count=correct_count,
        answers_feedback=feedback_items
    )
