from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, Profile
from app.models.course import Course
from app.models.document import Document, DocumentChunk
from app.models.knowledge import Topic, Concept, TopicRelationship
from app.models.quiz import Question, Quiz, QuizAttempt, Answer
from app.models.mastery import MasteryScore, Mistake
from app.models.flashcard import Flashcard
from app.models.pyq import PYQQuestion
from app.core.security import get_password_hash

class SeedService:
    def seed_demo_data(self, db: Session):
        # 1. Check or Create Demo User
        demo_user = db.query(User).filter(User.email == "student@studymind.ai").first()
        if not demo_user:
            demo_user = User(
                email="student@studymind.ai",
                hashed_password=get_password_hash("password123"),
                full_name="Alex Mercer",
                role="student"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            profile = Profile(
                user_id=demo_user.id,
                institution="Stanford University",
                academic_level="Undergraduate Senior",
                xp=1450,
                streak_days=5,
                target_daily_hours=2.5
            )
            db.add(profile)

        # Teacher user
        teacher_user = db.query(User).filter(User.email == "teacher@studymind.ai").first()
        if not teacher_user:
            teacher_user = User(
                email="teacher@studymind.ai",
                hashed_password=get_password_hash("password123"),
                full_name="Prof. Andrew Ng",
                role="teacher"
            )
            db.add(teacher_user)
            db.commit()

        # 2. Create Machine Learning Course
        ml_course = db.query(Course).filter(Course.name == "Machine Learning (CS229)", Course.user_id == demo_user.id).first()
        if not ml_course:
            ml_course = Course(
                user_id=demo_user.id,
                name="Machine Learning (CS229)",
                subject="Computer Science",
                description="Core principles of supervised and unsupervised learning, kernel methods, optimization, and neural networks.",
                exam_date=datetime.utcnow() + timedelta(days=14),
                target_score=92.0,
                daily_study_time_minutes=120,
                difficulty="Hard",
                semester="Fall 2026"
            )
            db.add(ml_course)
            db.commit()
            db.refresh(ml_course)

        # 3. Create Topics & Concepts
        topic_defs = [
            ("Linear & Logistic Regression", "Foundational statistical learning algorithms for continuous and categorical predictions."),
            ("Support Vector Machines (SVM)", "Maximum margin classifiers, slack variables, and kernel tricks."),
            ("Decision Trees & Random Forests", "Non-parametric hierarchical decision boundaries, entropy, and ensemble methods."),
            ("Clustering (K-Means & DBSCAN)", "Unsupervised partitioning, centroid optimization, and density-based clustering."),
            ("Dimensionality Reduction (PCA)", "Principal Component Analysis, variance maximization, and eigenvector projection."),
            ("Neural Networks & Deep Learning", "Multi-layer perceptrons, backpropagation, and loss function optimization.")
        ]

        topic_objs = {}
        for t_name, t_desc in topic_defs:
            top = db.query(Topic).filter(Topic.course_id == ml_course.id, Topic.name == t_name).first()
            if not top:
                top = Topic(course_id=ml_course.id, name=t_name, description=t_desc)
                db.add(top)
                db.commit()
                db.refresh(top)
            topic_objs[t_name] = top

        # Topic Relationships (Prerequisites)
        if topic_objs.get("Support Vector Machines (SVM)") and topic_objs.get("Linear & Logistic Regression"):
            rel = db.query(TopicRelationship).filter(
                TopicRelationship.source_topic_id == topic_objs["Linear & Logistic Regression"].id,
                TopicRelationship.target_topic_id == topic_objs["Support Vector Machines (SVM)"].id
            ).first()
            if not rel:
                db.add(TopicRelationship(
                    source_topic_id=topic_objs["Linear & Logistic Regression"].id,
                    target_topic_id=topic_objs["Support Vector Machines (SVM)"].id,
                    relationship_type="prerequisite"
                ))

        # 4. Create Documents & Chunks
        doc = db.query(Document).filter(Document.course_id == ml_course.id, Document.title == "CS229_Unit4_SVM_and_Kernels.pdf").first()
        if not doc:
            doc = Document(
                course_id=ml_course.id,
                title="CS229_Unit4_SVM_and_Kernels.pdf",
                file_type="pdf",
                file_size_bytes=2450000,
                status="ready"
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            chunks = [
                (1, "4.1 Support Vector Classification", "Support Vector Machines (SVM) aim to construct a hyperplane in a high-dimensional space that maximizes the functional margin between two distinct classes."),
                (2, "4.2 The Kernel Trick", "The kernel trick enables SVMs to operate in a high-dimensional feature space without explicitly computing the coordinates of data in that space. Popular kernels include Linear, Polynomial, and Radial Basis Function (RBF)."),
                (3, "4.3 Soft Margin & Slack Variables", "For non-linearly separable training sets, slack variables are introduced to allow a trade-off between margin size and classification errors governed by hyperparameter C.")
            ]
            for page, sec, content in chunks:
                db.add(DocumentChunk(
                    document_id=doc.id,
                    chunk_index=page,
                    page_number=page,
                    section_heading=sec,
                    content=content,
                    embedding_ref=f"chunk_{doc.id}_{page}"
                ))

        # 5. Seed Initial Mastery Scores
        svm_topic = topic_objs.get("Support Vector Machines (SVM)")
        if svm_topic:
            mastery = db.query(MasteryScore).filter(MasteryScore.user_id == demo_user.id, MasteryScore.topic_id == svm_topic.id).first()
            if not mastery:
                db.add(MasteryScore(
                    user_id=demo_user.id,
                    course_id=ml_course.id,
                    topic_id=svm_topic.id,
                    score=48.0,
                    confidence=60.0,
                    attempts_count=4,
                    correct_count=2,
                    last_tested_at=datetime.utcnow() - timedelta(days=3),
                    explanation={
                        "accuracy_percent": 50.0,
                        "difficulty_bonus": 4.0,
                        "recency_penalty": 6.0,
                        "summary": "Recent quizzes indicate moderate recall. Focus on Kernel Methods."
                    }
                ))

            # Seed Mistakes
            mistake = db.query(Mistake).filter(Mistake.user_id == demo_user.id, Mistake.topic_id == svm_topic.id).first()
            if not mistake:
                db.add(Mistake(
                    user_id=demo_user.id,
                    topic_id=svm_topic.id,
                    question_text="How does increasing hyperparameter C impact the SVM decision margin?",
                    student_answer="It increases the margin width.",
                    correct_answer="It shrinks the margin width to enforce stricter classification of training points.",
                    mistake_type="conceptual",
                    resolution_status="needs_revision",
                    occurrences=2
                ))

            # Seed Flashcards
            fc = db.query(Flashcard).filter(Flashcard.course_id == ml_course.id, Flashcard.front.like("%Kernel Trick%")).first()
            if not fc:
                db.add(Flashcard(
                    course_id=ml_course.id,
                    topic_id=svm_topic.id,
                    card_type="concept",
                    front="What is the main advantage of the Kernel Trick in SVM?",
                    back="It computes inner products in high-dimensional feature space without explicitly transforming input vectors, avoiding high computational overhead.",
                    interval_days=1,
                    repetitions=0,
                    next_review_at=datetime.utcnow()
                ))

        # 6. Seed PYQ Questions
        if svm_topic:
            pyq_check = db.query(PYQQuestion).filter(PYQQuestion.course_id == ml_course.id).first()
            if not pyq_check:
                pyqs = [
                    (2025, "State and derive the dual optimization formulation for Support Vector Machines with soft margins.", 10, "Hard", 3),
                    (2024, "Compare Radial Basis Function (RBF) kernel with Polynomial kernel in terms of hyperparameter sensitivity.", 5, "Medium", 2),
                    (2023, "Explain why Support Vector Machines are effective in high-dimensional spaces.", 5, "Easy", 3)
                ]
                for yr, q_txt, marks, diff, occ in pyqs:
                    db.add(PYQQuestion(
                        course_id=ml_course.id,
                        topic_id=svm_topic.id,
                        year=yr,
                        question_text=q_txt,
                        marks=marks,
                        difficulty=diff,
                        occurrences_count=occ
                    ))

        db.commit()

seed_service = SeedService()
