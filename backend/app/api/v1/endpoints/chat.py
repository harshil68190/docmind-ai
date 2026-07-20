"""
Chat endpoint.

Exposes `RAGPipeline.answer_question` as a stateless, single-turn Q&A
call scoped to the authenticated user's own documents. No conversation
history or persistence -- that's a `ChatService` + `conversations`/
`messages` table concern the original architecture doc scoped to a later
milestone; this endpoint only answers standalone questions.
"""
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_active_user, get_rag_pipeline
from app.models.user import User
from app.rag.pipeline import RAGPipeline
from app.schemas.chat_schema import ChatRequest, ChatResponse, CitationSchema

router = APIRouter()


@router.post(
    "",
    response_model=ChatResponse,
    summary="Ask a question against your uploaded documents",
)
def ask_question(
    payload: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> ChatResponse:
    answer, citations = rag_pipeline.answer_question(
        user_id=current_user.id, question=payload.question
    )
    return ChatResponse(
        answer=answer,
        citations=[CitationSchema(file=c.file, page=c.page) for c in citations],
    )
