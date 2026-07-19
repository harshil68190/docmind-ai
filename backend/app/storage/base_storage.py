"""
Storage backend interface.

`DocumentService` depends on this abstract type, never on
`LocalStorageService` directly (see `core/dependencies.py`'s
`get_storage_service`). Swapping local disk for S3/GCS later means writing
one new class here and changing one line in `get_storage_service` — nothing
in `DocumentService` changes.
"""
from abc import ABC, abstractmethod
from uuid import UUID


class BaseStorageService(ABC):
    @abstractmethod
    def save(self, *, user_id: UUID, document_id: UUID, filename: str, content: bytes) -> str:
        """Persists `content` and returns a storage_path identifying it."""

    @abstractmethod
    def read(self, storage_path: str) -> bytes:
        """Reads back the raw bytes at a previously returned storage_path."""

    @abstractmethod
    def delete_document_folder(self, *, user_id: UUID, document_id: UUID) -> None:
        """Deletes every file belonging to one document (original + derived artifacts)."""
