"""
Document chunking via LangChain's RecursiveCharacterTextSplitter.

Operates on `ExtractedPage` records (see `services/ingestion/extractor_service.py`)
rather than one flat string, specifically so each resulting chunk can carry
the exact page it came from -- this is what makes page-level citations
(Milestone 4 Step 8) precise rather than approximate. A chunk is never
split across two pages: each page is chunked independently, so the worst
case is a slightly smaller-than-usual final chunk at a page boundary, not
a chunk with an ambiguous page attribution.
"""
from dataclasses import dataclass

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.services.ingestion.extractor_service import ExtractedPage

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


@dataclass(frozen=True)
class Chunk:
    """One retrieval-ready unit of text, tagged with its source page."""

    chunk_index: int
    page_number: int | None
    text: str


def chunk_pages(pages: list[ExtractedPage]) -> list[Chunk]:
    """
    Splits every page's text into `Chunk`s using LangChain's recursive
    character splitter (tries paragraph breaks first, then sentence, word,
    and finally character boundaries, always respecting `chunk_size`),
    configured to `chunk_size=800` / `chunk_overlap=100` per spec.
    `chunk_index` is sequential across the whole document, independent of
    which page a chunk came from -- it's the retrieval ordering key, not a
    per-page counter.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    chunks: list[Chunk] = []
    for page in pages:
        for page_chunk_text in splitter.split_text(page.text):
            chunks.append(
                Chunk(
                    chunk_index=len(chunks),
                    page_number=page.page_number,
                    text=page_chunk_text,
                )
            )
    return chunks
