"""
Groq response generation via langchain-google-genai.

This is the only module in the codebase that talks to Groq directly --
if the LLM provider ever changes, this file (plus the two settings in
`core/config.py`) is everything that needs to change; `pipeline.py` and
everything upstream of it only know about "generate an answer from these
retrieved chunks", not which provider does it.
"""
from langchain_groq import ChatGroq
from app.core.config import settings
from app.core.exceptions import GenerationFailedException
from app.rag.prompts import FALLBACK_ANSWER, build_messages
from app.rag.vector_store import SearchResult


class GeneratorService:
    def __init__(self) -> None:
        self._llm: ChatGroq | None = None

    def _get_llm(self) -> ChatGroq:
        if self._llm is None:
            self._llm = ChatGroq(
                model=settings.GROQ_MODEL_NAME,
                api_key=settings.GROQ_API_KEY,
                temperature=0.0,
            )
        return self._llm

    def generate(self, question: str, results: list[SearchResult]) -> str:
        if not results:
            return FALLBACK_ANSWER

        messages = build_messages(question, results)

        try:
            response = self._get_llm().invoke(messages)
        except Exception as exc:
            import traceback

            traceback.print_exc()

            raise GenerationFailedException(
                f"Groq error: {type(exc).__name__}: {exc}"
            ) from exc

        return str(response.content).strip()
