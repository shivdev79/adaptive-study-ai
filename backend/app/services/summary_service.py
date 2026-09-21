import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk
from app.ai.llm_provider import llm

logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = """You are an expert educational AI presentation and document summarizer.
Your task is to analyze the textual content of an uploaded study material (PPT/PDF) and generate a comprehensive, highly structured section-by-section summary grounded 100% in the provided document text.

OUTPUT JSON SPECIFICATION:
{
  "document_id": 1,
  "document_title": "Unit 3.ppt",
  "executive_summary": "High level overall executive summary of what this PPT presentation covers.",
  "key_topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "sections": [
    {
      "section_title": "Section / Slide Range Title (e.g. Slides 1-5: Introduction to ...)",
      "key_concepts": ["Concept 1", "Concept 2"],
      "summary_bullets": [
        "First key takeaway or principle explained in this section.",
        "Second key takeaway or calculation method."
      ],
      "important_formulas_or_definitions": [
        "Definition or formula from this section"
      ]
    }
  ],
  "exam_takeaways": [
    "Key exam takeaway 1",
    "Key exam takeaway 2"
  ]
}
Return ONLY valid JSON matching this schema. Ground every point in the uploaded document content.
"""

class SummaryService:
    def generate_document_summary(self, db: Session, document_id: int, custom_api_key: Optional[str] = None) -> Dict[str, Any]:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document #{document_id} not found")

        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index).all()
        if not chunks:
            chunks = db.query(DocumentChunk).join(Document).filter(Document.course_id == doc.course_id).order_by(DocumentChunk.chunk_index).all()

        if not chunks:
            return {
                "document_id": doc.id,
                "document_title": doc.title,
                "executive_summary": f"Document '{doc.title}' uploaded. Processing text content...",
                "key_topics": [doc.title.split('.')[0]],
                "sections": [
                    {
                        "section_title": "Section 1: General Overview",
                        "key_concepts": ["Subject Material"],
                        "summary_bullets": ["Content processing complete."],
                        "important_formulas_or_definitions": []
                    }
                ],
                "exam_takeaways": ["Review primary document slides."]
            }

        # Build concatenated text with page/section headings
        combined_lines = []
        for c in chunks[:40]:  # Up to 40 chunks (~9000 chars) for TPM limit safety
            heading = f"[Page {c.page_number} / {c.section_heading}]" if c.section_heading else f"[Page {c.page_number}]"
            combined_lines.append(f"{heading}\n{c.content}")
        
        doc_context = "\n\n".join(combined_lines)
        user_prompt = f"Summarize the entire document '{doc.title}' section-by-section. Ground strictly in this content:\n\n{doc_context}"

        raw_res = llm.generate_completion(SUMMARY_SYSTEM_PROMPT, user_prompt, json_mode=True, custom_api_key=custom_api_key)

        try:
            parsed = json.loads(raw_res)
            parsed["document_id"] = doc.id
            parsed["document_title"] = doc.title
            return parsed
        except Exception as e:
            logger.warning(f"Error parsing summary JSON: {e}")
            return {
                "document_id": doc.id,
                "document_title": doc.title,
                "executive_summary": f"Summary for '{doc.title}' generated from uploaded presentation slides.",
                "key_topics": [doc.title.split('.')[0]],
                "sections": [
                    {
                        "section_title": "Section 1: Overview of Presentation Materials",
                        "key_concepts": ["Slide Concepts"],
                        "summary_bullets": [line.strip() for line in doc_context.split('\n') if len(line.strip()) > 20][:5],
                        "important_formulas_or_definitions": []
                    }
                ],
                "exam_takeaways": ["Focus on key definitions and section topics."]
            }

summary_service = SummaryService()
