"""
FAISS-backed vector storage.

Wraps a `faiss.IndexFlatIP` (inner-product search, which is equivalent to
cosine similarity because embeddings are L2-normalized -- see
`embedding.py`) together with a parallel metadata list, since FAISS itself
only stores vectors and integer row positions, nothing else. Persisted to
disk as two files per index (`{name}.faiss` + `{name}.meta.json`) so an
index survives process restarts without re-embedding every document.

Indexes are namespaced by `index_name` -- the pipeline (Step 9) uses the
owning user's id as the name. This is a deliberate security property, not
just an implementation detail: retrieval is structurally isolated per user
because each user's vectors live in a physically separate index file,
rather than depending on a metadata filter that a future call site could
forget to apply.
"""
import json
from dataclasses import asdict, dataclass
from pathlib import Path

import faiss
import numpy as np

from app.core.config import settings


@dataclass(frozen=True)
class ChunkMetadata:
    """Everything needed to attribute a retrieved chunk back to its source."""

    chunk_id: str
    document_id: str
    filename: str
    page_number: int | None
    text: str


@dataclass(frozen=True)
class SearchResult:
    metadata: ChunkMetadata
    score: float


class FaissVectorStore:
    def __init__(self, index_name: str, dimension: int, base_dir: str | None = None) -> None:
        self.index_name = index_name
        self.dimension = dimension
        self.base_dir = Path(base_dir or settings.VECTOR_STORE_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

        self._index_path = self.base_dir / f"{index_name}.faiss"
        self._metadata_path = self.base_dir / f"{index_name}.meta.json"

        self._index = self._load_index()
        self._metadata: list[ChunkMetadata] = self._load_metadata()

    def _load_index(self) -> faiss.Index:
        if self._index_path.exists():
            return faiss.read_index(str(self._index_path))
        return faiss.IndexFlatIP(self.dimension)

    def _load_metadata(self) -> list[ChunkMetadata]:
        if self._metadata_path.exists():
            raw = json.loads(self._metadata_path.read_text(encoding="utf-8"))
            return [ChunkMetadata(**item) for item in raw]
        return []

    def add(self, embeddings: np.ndarray, metadata: list[ChunkMetadata]) -> None:
        """
        Adds vectors and their metadata together. `embeddings` must be a
        `(len(metadata), dimension)` float32 array, row-aligned with
        `metadata` -- FAISS's internal IDs are just row positions, so
        preserving that alignment is this method's entire contract.
        """
        if len(embeddings) != len(metadata):
            raise ValueError("embeddings and metadata must have the same length")
        if len(embeddings) == 0:
            return
        self._index.add(embeddings)
        self._metadata.extend(metadata)
        self._persist()

    def search(self, query_embedding: np.ndarray, top_k: int) -> list[SearchResult]:
        """Returns up to `top_k` nearest chunks by cosine similarity, best first."""
        if self._index.ntotal == 0:
            return []
        k = min(top_k, self._index.ntotal)
        scores, indices = self._index.search(query_embedding.reshape(1, -1), k)
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # FAISS pads with -1 when fewer than k results exist
                continue
            results.append(SearchResult(metadata=self._metadata[idx], score=float(score)))
        return results

    def delete_document(self, document_id: str) -> None:
        """
        Removes every chunk belonging to `document_id`. `IndexFlatIP`
        doesn't support in-place row deletion, so this rebuilds the index
        from the surviving vectors via `reconstruct()` -- an `IndexFlat`
        stores raw vectors directly, which is exactly what makes
        reconstruction possible (compressed FAISS index types generally
        don't support this). Rebuilding is O(n) in the index size, which is
        acceptable at the scale of one user's personal document index, and
        far simpler than a tombstone/compaction scheme.
        """
        keep_mask = [m.document_id != document_id for m in self._metadata]
        if all(keep_mask):
            return  # nothing belonging to this document -- no-op

        surviving_metadata = [m for m, keep in zip(self._metadata, keep_mask) if keep]
        if surviving_metadata:
            surviving_vectors = np.vstack(
                [self._index.reconstruct(i) for i, keep in enumerate(keep_mask) if keep]
            )
        else:
            surviving_vectors = np.empty((0, self.dimension), dtype="float32")

        self._index = faiss.IndexFlatIP(self.dimension)
        if len(surviving_vectors) > 0:
            self._index.add(surviving_vectors)
        self._metadata = surviving_metadata
        self._persist()

    def _persist(self) -> None:
        faiss.write_index(self._index, str(self._index_path))
        self._metadata_path.write_text(
            json.dumps([asdict(m) for m in self._metadata]), encoding="utf-8"
        )

    @property
    def total_chunks(self) -> int:
        return len(self._metadata)
