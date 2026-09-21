from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database.session import get_db
from app.models.user import User
from app.models.knowledge import Topic, Concept, TopicRelationship
from app.models.mastery import MasteryScore
from app.core.security import get_current_user

router = APIRouter(prefix="/knowledge-graph", tags=["Knowledge Graph"])

@router.get("/{course_id}")
def get_knowledge_graph(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = db.query(Topic).filter(Topic.course_id == course_id).all()
    mastery_map = {
        m.topic_id: m.score for m in db.query(MasteryScore).filter(
            MasteryScore.user_id == current_user.id,
            MasteryScore.course_id == course_id
        ).all()
    }

    nodes = []
    for t in topics:
        score = mastery_map.get(t.id, 50.0)
        nodes.append({
            "id": f"topic_{t.id}",
            "label": t.name,
            "type": "topic",
            "description": t.description,
            "mastery_score": score,
            "difficulty": "Medium"
        })

    topic_ids = [t.id for t in topics]
    relationships = db.query(TopicRelationship).filter(
        TopicRelationship.source_topic_id.in_(topic_ids)
    ).all()

    edges = []
    for r in relationships:
        edges.append({
            "id": f"edge_{r.id}",
            "source": f"topic_{r.source_topic_id}",
            "target": f"topic_{r.target_topic_id}",
            "relationship": r.relationship_type
        })

    return {
        "course_id": course_id,
        "nodes": nodes,
        "edges": edges
    }
