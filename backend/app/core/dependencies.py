"""
FastAPI dependency providers.

This is the single place where request-scoped resources are wired up and
injected into endpoints via `Depends(...)`. Keeping DI centralized here
(rather than constructing sessions/services inline in endpoint functions)
is what makes it possible to override dependencies in tests (e.g. swap
`get_db` for a session pointed at a test database) without touching
endpoint code.
"""
from collections.abc import Generator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException
from app.db.session import SessionLocal
from app.models.user import User
from app.rag.embedding import EmbeddingService
from app.rag.generator import GeneratorService
from app.rag.pipeline import RAGPipeline
from app.repositories.document_repository import DocumentRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.document_service import DocumentService
from app.services.ingestion.extractor_service import ExtractionService
from app.storage.base_storage import BaseStorageService
from app.storage.local_storage import LocalStorageService

# `auto_error=True` makes FastAPI return a 403 with a clear message if the
# Authorization header is missing entirely, before our code even runs —
# `get_current_user` below only has to handle a *present but invalid* token.
_bearer_scheme = HTTPBearer(auto_error=True)


def get_db() -> Generator[Session, None, None]:
    """
    Yields a database session for the lifetime of a single request, and
    guarantees it is closed afterward regardless of whether the request
    succeeded or raised — this is why it's a generator dependency rather
    than a plain function.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """
    Decodes the bearer token and loads the corresponding user. Any endpoint
    that depends on this (directly or via `get_current_active_user`) is
    automatically a protected endpoint — there's no separate "is this route
    protected" flag to keep in sync elsewhere.
    """
    return auth_service.get_user_from_access_token(credentials.credentials)


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise ForbiddenException("This account has been deactivated")
    return current_user


def get_storage_service() -> BaseStorageService:
    return LocalStorageService()


def get_extraction_service() -> ExtractionService:
    return ExtractionService()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()


def get_generator_service() -> GeneratorService:
    return GeneratorService()


def get_rag_pipeline(
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    generator_service: GeneratorService = Depends(get_generator_service),
) -> RAGPipeline:
    return RAGPipeline(embedding_service, generator_service)


def get_document_service(
    db: Session = Depends(get_db),
    storage_service: BaseStorageService = Depends(get_storage_service),
    extraction_service: ExtractionService = Depends(get_extraction_service),
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> DocumentService:
    return DocumentService(DocumentRepository(db), storage_service, extraction_service, rag_pipeline)

