import re
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Document
from app.ai.embedding_service import embedding_service
from app.schemas.tutor import Citation

logger = logging.getLogger(__name__)

class RAGService:
    def rewrite_query(self, query: str) -> str:
        # Simple clean query normalization
        clean = re.sub(r'[^\w\s]', '', query.lower()).strip()
        return clean

    def retrieve_context(
        self, db: Session, course_id: int, query: str, top_k: int = 4
    ) -> Tuple[str, List[Citation]]:
        chunks = (
            db.query(DocumentChunk)
            .join(Document, DocumentChunk.document_id == Document.id)
            .filter(Document.course_id == course_id)
            .all()
        )

        if not chunks:
            return "", []

        query_tokens = set(self.rewrite_query(query).split())
        query_vec = embedding_service.get_embedding(query)

        scored_chunks: List[Tuple[float, DocumentChunk, Document]] = []

        for chunk in chunks:
            doc = chunk.document
            content_tokens = set(chunk.content.lower().split())
            
            # BM25 Keyword Match Score (Jaccard token overlap)
            token_overlap = len(query_tokens.intersection(content_tokens)) / max(len(query_tokens), 1)
            
            # Vector Similarity
            chunk_vec = embedding_service.get_embedding(chunk.content)
            vec_sim = embedding_service.cosine_similarity(query_vec, chunk_vec)
            
            # Hybrid combined score
            hybrid_score = (0.4 * token_overlap) + (0.6 * vec_sim)
            scored_chunks.append((hybrid_score, chunk, doc))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_chunks[:top_k]

        context_texts = []
        citations: List[Citation] = []

        for score, chunk, doc in top_results:
            context_texts.append(f"[{doc.title} - Page {chunk.page_number or 1}]:\n{chunk.content}")
            citations.append(
                Citation(
                    document_title=doc.title,
                    page_number=chunk.page_number or 1,
                    section=chunk.section_heading or "Main Text",
                    snippet=chunk.content[:150] + "..." if len(chunk.content) > 150 else chunk.content
                )
            )

        context_str = "\n\n".join(context_texts)
        return context_str, citations

rag_service = RAGService()
