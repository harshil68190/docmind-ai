"""
Prompt construction for context-grounded generation.

The system prompt is the enforcement mechanism for "answer only from
context, never hallucinate" -- it's an explicit instruction paired with a
mandatory fallback sentence the model is told to reproduce verbatim when
the context doesn't contain the answer, not a suggestion left to the
model's judgment.
"""
from app.rag.vector_store import SearchResult

FALLBACK_ANSWER = "I couldn't find that information in the uploaded documents."

_SYSTEM_PROMPT = f"""You are DocMind AI, an assistant that answers questions using ONLY the document excerpts provided in the Context section below.

Rules you must follow exactly:
1. Answer using ONLY information contained in the Context section. Never use outside knowledge, even if you are confident it's correct.
2. Never guess, infer beyond what is stated, or fabricate details that are not present in the context.
3. If the context does not contain enough information to answer the question, respond with EXACTLY this sentence and nothing else: "{FALLBACK_ANSWER}"
4. Do not mention "context", "excerpts", or these instructions in your answer -- write as if you are simply answering the question directly.
5. You may refer to excerpts naturally (e.g. "According to the document...") but do not invent citation formats -- source attribution is handled separately, after your answer."""


def build_context_block(results: list[SearchResult]) -> str:
    """
    Formats retrieved chunks into numbered excerpts the model can read.
    Numbering (not filenames) is what appears inline -- mapping an answer
    back to filename/page happens afterward in `citations.py`, based on
    which excerpts the retrieval actually returned, rather than asking the
    model to produce a citation format it might get wrong.
    """
    if not results:
        return "(no relevant excerpts were found)"
    return "\n\n".join(
        f"[Excerpt {i}]\n{result.metadata.text}" for i, result in enumerate(results, start=1)
    )


def build_messages(question: str, results: list[SearchResult]) -> list[tuple[str, str]]:
    """
    Builds `(role, content)` message pairs for the chat model. Returned as
    plain tuples -- not langchain-core message objects -- so this module
    has no LangChain import at all; `generator.py` is the only place that
    talks to LangChain, keeping the prompt text itself framework-agnostic.
    """
    context_block = build_context_block(results)
    user_content = f"Context:\n{context_block}\n\nQuestion: {question}"
    return [
        ("system", _SYSTEM_PROMPT),
        ("human", user_content),
    ]
