"""
RAG pipeline.

The composition root for this package: nothing outside `app/rag/` should
import `embedding.py`, `splitter.py`, `vector_store.py`, `retriever.py`,
`generator.py`, or `citations.py` directly -- everything goes through
`RAGPipeline`. It exposes exactly two operations:

  - `ingest_document(...)`: parse -> chunk -> embed -> store. Called once,
    after a document finishes text extraction (Milestone 3's
    `DocumentService`).
  - `answer_question(...)`: retrieve -> generate -> cite. Called by the
    chat API (Step 10).

Each user's chunks live in their own FAISS index (see `vector_store.py`),
so both operations take a `user_id` and never cross that boundary.
"""
from uuid import UUID

from app.rag.citations import Citation, build_citations
from app.rag.embedding import EmbeddingService
from app.rag.generator import GeneratorService
from app.rag.retriever import Retriever
from app.rag.splitter import chunk_pages
from app.rag.vector_store import ChunkMetadata, FaissVectorStore
from app.services.ingestion.extractor_service import ExtractedPage


class RAGPipeline:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        generator_service: GeneratorService,
    ) -> None:
        self.embedding_service = embedding_service
        self.generator_service = generator_service

    def _vector_store_for_user(self, user_id: UUID) -> FaissVectorStore:
        return FaissVectorStore(
            index_name=str(user_id), dimension=self.embedding_service.dimension
        )

    def ingest_document(
        self,
        *,
        user_id: UUID,
        document_id: UUID,
        filename: str,
        pages: list[ExtractedPage],
    ) -> int:
        """
        Chunks, embeds, and stores every page of a newly extracted
        document into that user's FAISS index. Returns the number of
        chunks stored.
        """
        chunks = chunk_pages(pages)
        if not chunks:
            return 0

        embeddings = self.embedding_service.embed_texts([chunk.text for chunk in chunks])
        metadata = [
            ChunkMetadata(
                chunk_id=f"{document_id}:{chunk.chunk_index}",
                document_id=str(document_id),
                filename=filename,
                page_number=chunk.page_number,
                text=chunk.text,
            )
            for chunk in chunks
        ]

        store = self._vector_store_for_user(user_id)
        store.add(embeddings, metadata)
        return len(chunks)

    def remove_document(self, *, user_id: UUID, document_id: UUID) -> None:
        """Removes every chunk belonging to `document_id` from the user's index."""
        store = self._vector_store_for_user(user_id)
        store.delete_document(str(document_id))

    def answer_question(self, *, user_id: UUID, question: str) -> tuple[str, list[Citation]]:
        """
        Answers `question` using only `user_id`'s own documents. Returns
        `(answer, citations)` -- citations are already empty if the
        no-context fallback answer was produced (see `citations.py`).
        """
        store = self._vector_store_for_user(user_id)
        retriever = Retriever(self.embedding_service, store)
        results = retriever.retrieve(question)

        answer = self.generator_service.generate(question, results)
        citations = build_citations(answer, results)
        return answer, citations
