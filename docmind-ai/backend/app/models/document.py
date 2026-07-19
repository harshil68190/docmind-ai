"""
Document ORM model.

Deliberately does NOT have an `extracted_text` column. Storing potentially
large extracted text in Postgres would bloat the table and slow down every
`SELECT *` on it; instead, extracted text is written to `extracted.txt`
alongside the original file (see `LocalStorageService`) and only its
length is recorded here (`text_length`) — enough for the UI and for a
future chunking step to know a document is ready without loading the text
into every query.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class DocumentStatus(str, enum.Enum):
    UPLOADING = "UPLOADING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Sanitized, filesystem-safe name used for the file on disk. Distinct
    # from `original_filename` (what the user uploaded, shown in the UI) —
    # see `utils/filenames.py` for why they can differ.
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_extension: Mapped[str] = mapped_column(String(10), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)  # bytes

    # Absolute/relative path on the storage backend. Never serialized in any
    # API response — see `schemas/document_schema.py`.
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)

    status: Mapped[DocumentStatus] = mapped_column(
        SAEnum(DocumentStatus, name="document_status", native_enum=True),
        default=DocumentStatus.UPLOADING,
        nullable=False,
    )
    text_length: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:  # pragma: no cover - debug convenience only
        return f"<Document id={self.id} filename={self.original_filename!r} status={self.status}>"
