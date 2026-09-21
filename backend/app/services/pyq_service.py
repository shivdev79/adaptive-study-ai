from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.pyq import PYQQuestion
from app.models.knowledge import Topic

class PYQService:
    def get_topic_frequencies(self, db: Session, course_id: int) -> List[Dict[str, Any]]:
        pyqs = db.query(PYQQuestion).filter(PYQQuestion.course_id == course_id).all()
        if not pyqs:
            return []

        total_pyqs = len(pyqs)
        topic_counts: Dict[int, int] = {}

        for p in pyqs:
            tid = p.topic_id or 0
            topic_counts[tid] = topic_counts.get(tid, 0) + p.occurrences_count

        topics_map = {t.id: t.name for t in db.query(Topic).filter(Topic.course_id == course_id).all()}

        results = []
        for tid, count in topic_counts.items():
            t_name = topics_map.get(tid, "General Concepts")
            pct = round((count / max(total_pyqs, 1)) * 100.0, 1)
            results.append({
                "topic_id": tid,
                "topic_name": t_name,
                "occurrences": count,
                "percentage": pct
            })

        results.sort(key=lambda x: x["occurrences"], reverse=True)
        return results

    def get_pyq_analysis_overview(self, db: Session, course_id: int) -> Dict[str, Any]:
        from app.models.course import Course
        from app.models.document import Document

        course = db.query(Course).filter(Course.id == course_id).first()
        course_name = course.name if course else "Course Study Material"

        docs = db.query(Document).filter(Document.course_id == course_id).all()
        freq_topics = []
        rep_concepts = []
        q_patterns = []
        diff_pattern = "Standard distribution based on uploaded study material."

        for d in docs:
            if d.doc_metadata and isinstance(d.doc_metadata, dict):
                pyq_meta = d.doc_metadata.get("pyq_analysis", {})
                if isinstance(pyq_meta, dict):
                    freq_topics.extend(pyq_meta.get("frequently_asked_topics", []))
                    rep_concepts.extend(pyq_meta.get("repeated_concepts", []))
                    q_patterns.extend(pyq_meta.get("question_patterns", []))
                    if pyq_meta.get("difficulty_patterns"):
                        diff_pattern = pyq_meta["difficulty_patterns"]

        freq_topics = list(dict.fromkeys(freq_topics))
        rep_concepts = list(dict.fromkeys(rep_concepts))
        q_patterns = list(dict.fromkeys(q_patterns))

        pyqs = db.query(PYQQuestion).filter(PYQQuestion.course_id == course_id).all()
        pyq_list = []
        for p in pyqs:
            pyq_list.append({
                "id": p.id,
                "course_id": p.course_id,
                "topic_id": p.topic_id,
                "topic_name": p.topic.name if p.topic else "General Concept",
                "year": p.year,
                "exam_name": p.exam_name,
                "question_text": p.question_text,
                "marks": p.marks,
                "difficulty": p.difficulty,
                "question_type": p.question_type,
                "occurrences_count": p.occurrences_count
            })

        topic_freqs = self.get_topic_frequencies(db, course_id)

        return {
            "course_id": course_id,
            "course_name": course_name,
            "frequently_asked_topics": freq_topics,
            "repeated_concepts": rep_concepts,
            "question_patterns": q_patterns,
            "difficulty_patterns": diff_pattern,
            "pyqs": pyq_list,
            "topic_frequencies": topic_freqs
        }

pyq_service = PYQService()
