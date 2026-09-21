from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("", response_model=CourseResponse)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = Course(
        user_id=current_user.id,
        name=course_in.name,
        subject=course_in.subject,
        description=course_in.description,
        exam_date=course_in.exam_date,
        target_score=course_in.target_score or 90.0,
        daily_study_time_minutes=course_in.daily_study_time_minutes or 120,
        difficulty=course_in.difficulty or "Medium",
        semester=course_in.semester
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    res = CourseResponse.from_orm(course)
    res.document_count = 0
    res.topic_count = 0
    res.overall_mastery = 0.0
    return res

@router.get("", response_model=List[CourseResponse])
def get_user_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    results = []
    for c in courses:
        doc_count = len(c.documents)
        topic_count = len(c.topics)
        scores = [m.score for m in c.mastery_scores]
        avg_mastery = round(sum(scores) / len(scores), 1) if scores else 50.0

        item = CourseResponse.from_orm(c)
        item.document_count = doc_count
        item.topic_count = topic_count
        item.overall_mastery = avg_mastery
        results.append(item)
    return results

@router.get("/{course_id}", response_model=CourseResponse)
def get_course_by_id(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    doc_count = len(course.documents)
    topic_count = len(course.topics)
    scores = [m.score for m in course.mastery_scores]
    avg_mastery = round(sum(scores) / len(scores), 1) if scores else 50.0

    res = CourseResponse.from_orm(course)
    res.document_count = doc_count
    res.topic_count = topic_count
    res.overall_mastery = avg_mastery
    return res
