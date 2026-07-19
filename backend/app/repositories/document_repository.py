"""
Document repository. Data access only — ownership checks, validation, and
storage/extraction orchestration all live in `DocumentService`, not here.
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.repositories.base_repository import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, Document)

    def create(self, **fields) -> Document:
        return self.add(Document(**fields))

    def list_for_user(self, user_id: UUID) -> list[Document]:
        stmt = (
            select(Document)
            .where(Document.user_id == user_id)
            .order_by(Document.created_at.desc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def update(self, document: Document, **fields) -> Document:
        for key, value in fields.items():
            setattr(document, key, value)
        self.db.commit()
        self.db.refresh(document)
        return document
