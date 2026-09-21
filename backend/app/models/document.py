from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, pptx, txt, pyq
    file_path = Column(String, nullable=True)
    file_size_bytes = Column(Integer, default=0)
    status = Column(String, default="uploaded")  # uploaded, extracting, structure_detected, embedding, ready, failed
    error_message = Column(Text, nullable=True)
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_heading = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    embedding_ref = Column(String, nullable=True)  # Reference ID in vector store
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")
