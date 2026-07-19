"""
Local filesystem storage.

Layout: `{UPLOAD_DIR}/{user_id}/{document_id}/{filename}`. Per-document
folders (keyed by UUID, never by filename) are what make filename
collisions and accidental overwrites structurally impossible — see
`utils/filenames.py` for the complementary sanitization step.
"""
import shutil
from pathlib import Path
from uuid import UUID

from app.core.config import settings
from app.storage.base_storage import BaseStorageService


class LocalStorageService(BaseStorageService):
    def __init__(self, base_dir: str | None = None) -> None:
        self.base_dir = Path(base_dir or settings.UPLOAD_DIR)

    def _document_dir(self, user_id: UUID, document_id: UUID) -> Path:
        return self.base_dir / str(user_id) / str(document_id)

    def save(self, *, user_id: UUID, document_id: UUID, filename: str, content: bytes) -> str:
        directory = self._document_dir(user_id, document_id)
        directory.mkdir(parents=True, exist_ok=True)
        file_path = directory / filename
        file_path.write_bytes(content)
        return str(file_path)

    def read(self, storage_path: str) -> bytes:
        return Path(storage_path).read_bytes()

    def delete_document_folder(self, *, user_id: UUID, document_id: UUID) -> None:
        directory = self._document_dir(user_id, document_id)
        if directory.exists():
            shutil.rmtree(directory)
