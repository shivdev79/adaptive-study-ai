from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.tutor import Conversation, Message
from app.schemas.tutor import ChatRequest, ConversationResponse, MessageResponse, Citation
from app.core.security import get_current_user
from app.ai.rag_service import rag_service
from app.ai.llm_provider import llm
from app.ai.prompts.tutor import TUTOR_SYSTEM_PROMPT, SOCRATIC_PROMPT

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])

@router.post("/chat", response_model=MessageResponse)
def chat_with_tutor(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve or create conversation
    if req.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == req.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(
            user_id=current_user.id,
            course_id=req.course_id,
            title=f"Chat: {req.message[:30]}...",
            mode=req.mode or "exam"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()

    # RAG context retrieval
    context, citations = rag_service.retrieve_context(db, req.course_id, req.message)

    # Truncate context to prevent Groq TPM overflow (system + user < 7500 chars)
    context_budget = max(0, 7000 - len(TUTOR_SYSTEM_PROMPT) - len(req.message))
    truncated_context = context[:context_budget] if context else ""

    # System prompt composition
    system_prompt = f"{TUTOR_SYSTEM_PROMPT}\nCurrent Mode: {req.mode.upper()}\nContext Material:\n{truncated_context if truncated_context else 'No document context found.'}"

    if req.mode == "socratic":
        system_prompt += f"\n{SOCRATIC_PROMPT}"

    # Generate completion
    assistant_content = llm.generate_completion(system_prompt, req.message)
    
    # Fallback if LLM returned empty response
    if not assistant_content or not assistant_content.strip():
        assistant_content = (
            "I'm having trouble connecting to the AI model right now. "
            "Please check your Groq API key in Settings, or try again in a moment. "
            "If the issue persists, the rate limit may have been reached."
        )

    # Followup recommendations
    followups = [
        "Can you give me an exam-style question on this?",
        "Explain it simpler using a real-world analogy.",
        "What are the most common student mistakes here?"
    ]

    # Save assistant response
    assistant_msg = Message(
        conversation_id=conv.id,
        sender="assistant",
        content=assistant_content,
        citations=[c.dict() for c in citations],
        suggested_followups=followups
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return MessageResponse(
        id=assistant_msg.id,
        sender="assistant",
        content=assistant_msg.content,
        citations=citations,
        suggested_followups=followups,
        created_at=assistant_msg.created_at
    )

@router.get("/conversations/course/{course_id}", response_model=List[ConversationResponse])
def get_course_conversations(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convs = db.query(Conversation).filter(
        Conversation.course_id == course_id,
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    return convs

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation_detail(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv
