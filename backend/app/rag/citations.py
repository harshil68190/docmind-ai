"""
Citation formatting.

Citations are derived from every chunk that was retrieved and given to
Gemini as context -- not from parsing which specific excerpt the model's
answer actually drew on. The prompt deliberately doesn't ask the model to
emit per-excerpt reference markers (see `prompts.py`'s docstring), so "was
part of the retrieved context" is the citation boundary this pipeline can
honestly claim. Deduplicated by (filename, page) and ordered by first
appearance, which is retrieval-relevance order since `results` arrives
already ranked best-first.
"""
from dataclasses import dataclass

from app.rag.prompts import FALLBACK_ANSWER
from app.rag.vector_store import SearchResult


@dataclass(frozen=True)
class Citation:
    file: str
    page: int | None


def build_citations(answer: str, results: list[SearchResult]) -> list[Citation]:
    """
    Returns deduplicated citations for `results`. Returns an empty list
    whenever `answer` is the exact fallback sentence -- an answer that
    says "I couldn't find that" showing citations anyway would be
    self-contradictory, regardless of what happened to be retrieved.
    """
    if answer.strip() == FALLBACK_ANSWER:
        return []

    seen: set[tuple[str, int | None]] = set()
    citations: list[Citation] = []
    for result in results:
        key = (result.metadata.filename, result.metadata.page_number)
        if key in seen:
            continue
        seen.add(key)
        citations.append(Citation(file=result.metadata.filename, page=result.metadata.page_number))
    return citations
