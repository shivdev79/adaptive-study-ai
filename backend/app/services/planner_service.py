from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.planner import StudyPlan, StudySession
from app.models.knowledge import Topic
from app.models.mastery import MasteryScore, Mistake
from app.models.pyq import PYQQuestion

class PlannerService:
    def generate_study_plan(
        self, db: Session, user_id: int, course_id: int, plan_mode: str = "standard", available_minutes: int = 120
    ) -> StudyPlan:
        # Check existing plan
        plan = db.query(StudyPlan).filter(
            StudyPlan.user_id == user_id,
            StudyPlan.course_id == course_id,
            StudyPlan.plan_mode == plan_mode
        ).first()

        if plan:
            # Delete old sessions
            db.query(StudySession).filter(StudySession.study_plan_id == plan.id).delete()
        else:
            plan = StudyPlan(
                user_id=user_id,
                course_id=course_id,
                title="Personalized Study Plan" if plan_mode == "standard" else "2-Hour Crash Mode Plan",
                plan_mode=plan_mode,
                total_hours_scheduled=available_minutes / 60.0
            )
            db.add(plan)
            db.commit()

        topics = db.query(Topic).filter(Topic.course_id == course_id).all()
        if not topics:
            return plan

        # Fetch mastery scores
        masteries = {
            m.topic_id: m.score for m in db.query(MasteryScore).filter(
                MasteryScore.user_id == user_id,
                MasteryScore.course_id == course_id
            ).all()
        }

        # Sort topics ascending by mastery (weakest first)
        sorted_topics = sorted(topics, key=lambda t: masteries.get(t.id, 0.0))

        start_time = datetime.utcnow()

        if plan_mode == "crash_mode":
            # 2-Hour Minute-by-Minute Crash Schedule
            # 1. Weak Concept Deep Dive (45 min)
            # 2. High Frequency PYQs (30 min)
            # 3. Mistake Memory Review (25 min)
            # 4. Rapid Practice Quiz (20 min)
            weakest_topic = sorted_topics[0] if sorted_topics else None
            second_weakest = sorted_topics[1] if len(sorted_topics) > 1 else weakest_topic

            sessions_config = [
                (
                    f"Crash Focus: Weak Concept ({weakest_topic.name if weakest_topic else 'Core Topics'})",
                    45,
                    "study",
                    weakest_topic.id if weakest_topic else None,
                    "high"
                ),
                (
                    f"PYQ Rapid Practice: ({second_weakest.name if second_weakest else 'PYQs'})",
                    30,
                    "pyq_practice",
                    second_weakest.id if second_weakest else None,
                    "high"
                ),
                (
                    "Mistakes Vault & Formula Review",
                    25,
                    "flashcard_revision",
                    None,
                    "medium"
                ),
                (
                    "Diagnostic Checkpoint Quiz",
                    20,
                    "quiz",
                    weakest_topic.id if weakest_topic else None,
                    "high"
                ),
            ]
        else:
            # Standard Multi-day / Multi-session Plan
            sessions_config = []
            curr_offset = 0
            for topic in sorted_topics[:4]:
                score = masteries.get(topic.id, 0.0)
                duration = 45 if score < 60 else 30
                sessions_config.append((
                    f"Study & Practice: {topic.name} (Current Mastery: {score}%)",
                    duration,
                    "study",
                    topic.id,
                    "high" if score < 60 else "medium"
                ))
                sessions_config.append((
                    f"Quiz & Mastery Check: {topic.name}",
                    20,
                    "quiz",
                    topic.id,
                    "medium"
                ))

        running_time = start_time
        for title, dur, act_type, top_id, priority in sessions_config:
            sess = StudySession(
                study_plan_id=plan.id,
                topic_id=top_id,
                session_title=title,
                activity_type=act_type,
                scheduled_start=running_time,
                duration_minutes=dur,
                priority_level=priority
            )
            db.add(sess)
            running_time += timedelta(minutes=dur)

        db.commit()
        db.refresh(plan)
        return plan

planner_service = PlannerService()
