from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.planner import StudyPlan, StudySession
from app.schemas.planner import StudyPlanResponse, StudySessionResponse, CrashModeRequest
from app.core.security import get_current_user
from app.services.planner_service import planner_service

router = APIRouter(prefix="/study-plan", tags=["Study Planner"])

@router.get("/course/{course_id}", response_model=StudyPlanResponse)
def get_study_plan(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(StudyPlan).filter(
        StudyPlan.course_id == course_id,
        StudyPlan.user_id == current_user.id
    ).first()

    if not plan:
        plan = planner_service.generate_study_plan(db, current_user.id, course_id, "standard")

    sessions_res = [
        StudySessionResponse(
            id=s.id,
            topic_id=s.topic_id,
            topic_name=s.topic.name if s.topic else "General Review",
            session_title=s.session_title,
            activity_type=s.activity_type,
            scheduled_start=s.scheduled_start,
            duration_minutes=s.duration_minutes,
            is_completed=s.is_completed,
            priority_level=s.priority_level
        ) for s in plan.sessions
    ]

    return StudyPlanResponse(
        id=plan.id,
        course_id=plan.course_id,
        title=plan.title,
        plan_mode=plan.plan_mode,
        total_hours_scheduled=plan.total_hours_scheduled,
        created_at=plan.created_at,
        sessions=sessions_res
    )

@router.post("/generate/{course_id}", response_model=StudyPlanResponse)
def generate_standard_plan(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = planner_service.generate_study_plan(db, current_user.id, course_id, "standard")
    sessions_res = [
        StudySessionResponse(
            id=s.id,
            topic_id=s.topic_id,
            topic_name=s.topic.name if s.topic else "General Review",
            session_title=s.session_title,
            activity_type=s.activity_type,
            scheduled_start=s.scheduled_start,
            duration_minutes=s.duration_minutes,
            is_completed=s.is_completed,
            priority_level=s.priority_level
        ) for s in plan.sessions
    ]
    return StudyPlanResponse(
        id=plan.id,
        course_id=plan.course_id,
        title=plan.title,
        plan_mode=plan.plan_mode,
        total_hours_scheduled=plan.total_hours_scheduled,
        created_at=plan.created_at,
        sessions=sessions_res
    )

@router.post("/crash-mode", response_model=StudyPlanResponse)
def trigger_crash_mode(
    req: CrashModeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = planner_service.generate_study_plan(
        db=db,
        user_id=current_user.id,
        course_id=req.course_id,
        plan_mode="crash_mode",
        available_minutes=req.available_minutes or 120
    )
    sessions_res = [
        StudySessionResponse(
            id=s.id,
            topic_id=s.topic_id,
            topic_name=s.topic.name if s.topic else "General Review",
            session_title=s.session_title,
            activity_type=s.activity_type,
            scheduled_start=s.scheduled_start,
            duration_minutes=s.duration_minutes,
            is_completed=s.is_completed,
            priority_level=s.priority_level
        ) for s in plan.sessions
    ]
    return StudyPlanResponse(
        id=plan.id,
        course_id=plan.course_id,
        title=plan.title,
        plan_mode=plan.plan_mode,
        total_hours_scheduled=plan.total_hours_scheduled,
        created_at=plan.created_at,
        sessions=sessions_res
    )
