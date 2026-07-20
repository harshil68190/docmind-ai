"""
Embedding generation via Sentence-Transformers.

Uses `all-MiniLM-L6-v2`: 384-dimensional, fast enough for CPU inference,
and well-suited to a self-hosted RAG pipeline -- generating embeddings
locally means document ingestion has no per-chunk network call or external
API cost, unlike a hosted embeddings endpoint.
"""
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384  # all-MiniLM-L6-v2's fixed output size


@lru_cache
def _get_model() -> SentenceTransformer:
    """
    Cached model loader. Loading `SentenceTransformer` is the expensive
    part (reading weights into memory) -- `encode()` calls afterward are
    cheap by comparison. `lru_cache` on a no-argument function guarantees
    the model is loaded exactly once per process no matter how many
    `EmbeddingService` instances get created (FastAPI's DI creates a new
    service instance per request; they all share this one cached model).
    """
    return SentenceTransformer(EMBEDDING_MODEL_NAME)


class EmbeddingService:
    """Generates L2-normalized dense vector embeddings for text."""

    def __init__(self) -> None:
        # Loading is deferred to first use rather than done here. This
        # class is about to become a transitive dependency of every
        # document endpoint (via `RAGPipeline`), including list/get/
        # download calls that never touch embeddings at all -- eagerly
        # loading the model in `__init__` would mean a plain `GET
        # /documents` triggers a multi-second model load the first time
        # any document endpoint is hit. `_get_model()` is still
        # `lru_cache`-d, so the actual weights load exactly once per
        # process, on whichever request first calls `embed_texts` or
        # `embed_query`.
        self._model: SentenceTransformer | None = None

    def _get_model_instance(self) -> SentenceTransformer:
        if self._model is None:
            self._model = _get_model()
        return self._model

    @property
    def dimension(self) -> int:
        return EMBEDDING_DIMENSION

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        """
        Embeds a batch of texts (e.g. every chunk from one document) in a
        single call, which is materially faster than embedding one at a
        time. Returns a `(len(texts), EMBEDDING_DIMENSION)` float32 array,
        L2-normalized so that FAISS's inner-product index (see
        `vector_store.py`) computes cosine similarity, not raw dot product.
        """
        if not texts:
            return np.empty((0, self.dimension), dtype="float32")
        embeddings = self._get_model_instance().encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return embeddings.astype("float32")

    def embed_query(self, text: str) -> np.ndarray:
        """
        Embeds a single query string with the same normalization as
        `embed_texts` -- query and chunk vectors must be normalized the
        same way for cosine similarity between them to be meaningful.
        """
        return self.embed_texts([text])[0]
