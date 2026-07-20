"""
Semantic retrieval.

Composes `EmbeddingService` (query -> vector) and `FaissVectorStore`
(vector -> nearest chunks) into the single call the RAG pipeline needs:
"given this question, what are this user's most relevant chunks". Neither
of its two dependencies knows the other exists -- this module is where
they're introduced, and it's the only place that decision is made.
"""
from app.rag.embedding import EmbeddingService
from app.rag.vector_store import FaissVectorStore, SearchResult

TOP_K = 5


class Retriever:
    def __init__(self, embedding_service: EmbeddingService, vector_store: FaissVectorStore) -> None:
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    def retrieve(self, query: str, top_k: int = TOP_K) -> list[SearchResult]:
        """
        Returns up to `top_k` chunks most semantically relevant to `query`,
        best match first. An empty/whitespace-only query short-circuits to
        an empty result rather than embedding a meaningless string.
        """
        if not query.strip():
            return []
        query_embedding = self.embedding_service.embed_query(query)
        return self.vector_store.search(query_embedding, top_k=top_k)
