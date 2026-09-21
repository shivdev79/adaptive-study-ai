import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.core.security import get_current_user
from app.services.ingestion_service import ingestion_service

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "./uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    course_id: Optional[int] = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = None
    if course_id and course_id > 0:
        course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()

    if not course:
        # Auto-create Course from uploaded file name
        clean_course_name = file.filename.split(".")[0].replace("_", " ").replace("-", " ").title()
        course = Course(
            user_id=current_user.id,
            name=clean_course_name,
            subject="Uploaded Subject",
            description=f"Auto-generated course for uploaded material '{file.filename}'",
            target_score=90.0,
            daily_study_time_minutes=120,
            difficulty="Medium"
        )
        db.add(course)
        db.commit()
        db.refresh(course)

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "txt"
    if ext not in ["pdf", "docx", "pptx", "ppt", "txt", "png", "jpg"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: .{ext}")

    file_path = os.path.join(UPLOAD_DIR, f"course_{course.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    doc = Document(
        course_id=course.id,
        title=file.filename,
        file_type=ext,
        file_path=file_path,
        file_size_bytes=file_size,
        status="uploaded",
        doc_metadata={
            "course_id": course.id,
            "course_name": course.name,
            "subject": course.subject
        }
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Ingest text, chunks, topics, MCQs, and flashcards synchronously for instant availability
    ingestion_service.process_document(db, doc.id)

    db.refresh(doc)
    res = DocumentResponse.from_orm(doc)
    res.chunk_count = len(doc.chunks)
    return res

@router.get("/course/{course_id}", response_model=List[DocumentResponse])
def list_course_documents(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(Document).filter(Document.course_id == course_id).all()
    results = []
    for d in docs:
        item = DocumentResponse.from_orm(d)
        item.chunk_count = len(d.chunks)
        results.append(item)
    return results

@router.get("/{document_id}/status", response_model=DocumentResponse)
def get_document_status(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    res = DocumentResponse.from_orm(doc)
    res.chunk_count = len(doc.chunks)
    return res
