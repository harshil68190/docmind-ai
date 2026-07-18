"""
Generic base repository.

Every repository in the codebase (`UserRepository` today; `DocumentRepository`,
`ChunkRepository`, etc. in later milestones) extends this instead of
reimplementing get/add/delete — that repetition is exactly what the
repository layer exists to eliminate. Repositories contain ONLY database
operations; anything resembling a business rule (password hashing,
"is this email already taken", token issuance) belongs in a service, not
here.
"""
from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: type[ModelType]) -> None:
        self.db = db
        self.model = model

    def get_by_id(self, id_: UUID) -> ModelType | None:
        return self.db.get(self.model, id_)

    def add(self, instance: ModelType) -> ModelType:
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def delete(self, instance: ModelType) -> None:
        self.db.delete(instance)
        self.db.commit()
