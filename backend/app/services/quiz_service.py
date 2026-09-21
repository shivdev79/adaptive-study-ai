import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.quiz import Quiz, Question, QuizAttempt, Answer
from app.models.knowledge import Topic
from app.models.mastery import Mistake
from app.models.document import DocumentChunk, Document
from app.ai.llm_provider import llm
from app.ai.prompts.quiz import QUIZ_GEN_SYSTEM_PROMPT
from app.ai.prompts.evaluator import ANSWER_EVALUATION_PROMPT
from app.services.mastery_service import mastery_service

logger = logging.getLogger(__name__)

class QuizService:
    def generate_quiz(
        self, db: Session, course_id: int, topic_ids: Optional[List[int]] = None, quiz_type: str = "adaptive", total_questions: int = 5, difficulty: str = "medium"
    ) -> Quiz:
        if not topic_ids:
            topics = db.query(Topic).filter(Topic.course_id == course_id).all()
            topic_ids = [t.id for t in topics] if topics else []

        # Find available chunks for context
        chunks = (
            db.query(DocumentChunk)
            .join(Document, DocumentChunk.document_id == Document.id)
            .filter(Document.course_id == course_id)
            .limit(50)
            .all()
        )
        
        valid_chunk_contents = []
        if chunks:
            for c in chunks:
                if c.content:
                    txt = c.content.strip()
                    if (" obj" in txt or "/MediaBox" in txt or "/Linearized" in txt or "/FlateDecode" in txt or txt.startswith("%PDF") or "endobj" in txt):
                        continue
                    valid_chunk_contents.append(txt)

        context_text = "\n\n".join(valid_chunk_contents)

        if not context_text:
            topics = db.query(Topic).filter(Topic.course_id == course_id).all()
            if topics:
                context_text = f"Course Topics & Concepts: {', '.join([t.name for t in topics])}"

        user_prompt = f"Generate a {quiz_type} quiz with {total_questions} questions for difficulty level '{difficulty}'. Base questions ONLY on educational concepts, formulas, and theories in the course material. Ignore any formatting or file structural tags.\nContext:\n{context_text}"
        
        raw_res = llm.generate_completion(QUIZ_GEN_SYSTEM_PROMPT, user_prompt, json_mode=True)
        
        try:
            parsed = json.loads(raw_res)
            questions_data = parsed.get("questions", [])
        except Exception as e:
            logger.warning(f"Error parsing generated quiz JSON: {e}")
            questions_data = []

        quiz = Quiz(
            course_id=course_id,
            title=f"{quiz_type.title()} Assessment ({difficulty.title()})",
            quiz_type=quiz_type,
            total_questions=max(len(questions_data), 1),
            time_limit_minutes=15
        )
        db.add(quiz)
        db.commit()

        if not topic_ids:
            topics = db.query(Topic).filter(Topic.course_id == course_id).all()
            if not topics:
                new_t = Topic(course_id=course_id, name="General Study Module", description="Auto-generated module for quiz")
                db.add(new_t)
                db.commit()
                db.refresh(new_t)
                topics = [new_t]
            topic_ids = [t.id for t in topics]

        default_topic_id = topic_ids[0]

        for q in questions_data:
            q_type = q.get("question_type", "mcq")
            q_diff = q.get("difficulty", difficulty)
            q_prompt = q.get("prompt", "What is the key principle of this topic?")
            q_opts = q.get("options", None)
            q_ans = q.get("correct_answer", "Correct answer reference.")
            q_exp = q.get("explanation", "Grounded in course notes.")

            q_obj = Question(
                topic_id=default_topic_id,
                question_type=q_type,
                difficulty=q_diff,
                prompt=q_prompt,
                options=q_opts,
                correct_answer=q_ans,
                explanation=q_exp
            )
            db.add(q_obj)

        db.commit()
        db.refresh(quiz)
        return quiz

    def evaluate_quiz_submission(
        self, db: Session, user_id: int, quiz_id: int, answers_data: List[Dict[str, Any]], time_taken: int
    ) -> QuizAttempt:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")

        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            score_percentage=0.0,
            time_taken_seconds=time_taken
        )
        db.add(attempt)
        db.commit()

        total_score = 0.0
        total_questions = len(answers_data)
        topic_ids_affected = set()

        for ans in answers_data:
            q_id = ans.get("question_id")
            student_resp = ans.get("student_response", "").strip()

            question = db.query(Question).filter(Question.id == q_id).first()
            if not question:
                continue

            topic_ids_affected.add(question.topic_id)

            if question.question_type in ["mcq", "true_false"]:
                is_correct = student_resp.lower() == question.correct_answer.lower()
                score = 1.0 if is_correct else 0.0
                feedback = "Exact match correct answer!" if is_correct else f"Incorrect. The correct answer is: {question.correct_answer}"
                missing = [] if is_correct else [f"Review {question.prompt[:40]}..."]
                model_ans = question.correct_answer
            else:
                eval_prompt = f"Question: {question.prompt}\nReference Answer: {question.correct_answer}\nStudent Answer: {student_resp}"
                raw_eval = llm.generate_completion(ANSWER_EVALUATION_PROMPT, eval_prompt, json_mode=True)
                try:
                    parsed_eval = json.loads(raw_eval)
                    is_correct = parsed_eval.get("is_correct", False)
                    score = float(parsed_eval.get("score", 0.0))
                    feedback = parsed_eval.get("feedback", "Evaluated based on semantic understanding.")
                    missing = parsed_eval.get("missing_concepts", [])
                    model_ans = parsed_eval.get("model_answer", question.correct_answer)
                except Exception:
                    is_correct = False
                    score = 0.0
                    feedback = "Answer submitted for evaluation."
                    missing = ["Key concepts review needed"]
                    model_ans = question.correct_answer

            total_score += score

            answer_obj = Answer(
                attempt_id=attempt.id,
                question_id=question.id,
                student_response=student_resp,
                is_correct=is_correct,
                score=score,
                feedback=feedback,
                missing_concepts=missing,
                model_answer=model_ans
            )
            db.add(answer_obj)

            # Record mistake if incorrect
            if not is_correct:
                mistake = Mistake(
                    user_id=user_id,
                    topic_id=question.topic_id,
                    question_text=question.prompt,
                    student_answer=student_resp,
                    correct_answer=question.correct_answer,
                    mistake_type="conceptual" if question.question_type != "numerical" else "calculation",
                    resolution_status="needs_revision"
                )
                db.add(mistake)

        score_pct = (total_score / max(total_questions, 1)) * 100.0
        attempt.score_percentage = round(score_pct, 1)
        db.commit()

        # Trigger mastery update for affected topics
        for tid in topic_ids_affected:
            mastery_service.calculate_topic_mastery(db, user_id, quiz.course_id, tid)

        return attempt

quiz_service = QuizService()
