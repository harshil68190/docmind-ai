"""
Document service.

Orchestrates `DocumentRepository` (DB), `BaseStorageService` (disk), and
`ExtractionService` (text) to implement the upload/list/get/delete use
cases. This is the only place that decides *what* those three lower layers
do together — none of them know about each other.
"""
import uuid

from app.core.config import settings
from app.core.exceptions import NotFoundException
from app.models.document import Document, DocumentStatus
from app.repositories.document_repository import DocumentRepository
from app.services.ingestion.extractor_service import ExtractionService
from app.storage.base_storage import BaseStorageService
from app.utils.file_validator import resolve_mime_type, validate_extension, validate_size
from app.utils.filenames import generate_safe_filename


class DocumentService:
    def __init__(
        self,
        document_repository: DocumentRepository,
        storage_service: BaseStorageService,
        extraction_service: ExtractionService,
    ) -> None:
        self.document_repository = document_repository
        self.storage_service = storage_service
        self.extraction_service = extraction_service

    def upload_document(
        self, *, user_id: uuid.UUID, original_filename: str, content: bytes
    ) -> Document:
        extension = validate_extension(original_filename)
        validate_size(len(content), settings.max_upload_size_bytes)
        mime_type = resolve_mime_type(extension)

        # Created first (status=UPLOADING) so we have a document_id to key
        # the storage folder on — the DB row exists slightly before the
        # file does, which is the reverse of what you might expect, but
        # it's what makes "one folder per document_id" possible at all.
        document = self.document_repository.create(
            user_id=user_id,
            filename=generate_safe_filename(original_filename),
            original_filename=original_filename[:255],
            file_extension=extension,
            mime_type=mime_type,
            file_size=len(content),
            storage_path="",
            status=DocumentStatus.UPLOADING,
        )

        storage_path = self.storage_service.save(
            user_id=user_id,
            document_id=document.id,
            filename=document.filename,
            content=content,
        )
        document = self.document_repository.update(
            document, storage_path=storage_path, status=DocumentStatus.PROCESSING
        )

        self._extract_and_finalize(document)
        return document

    def _extract_and_finalize(self, document: Document) -> Document:
        try:
            extracted_text = self.extraction_service.extract(
                document.storage_path, document.file_extension
            )
            self.storage_service.save(
                user_id=document.user_id,
                document_id=document.id,
                filename="extracted.txt",
                content=extracted_text.encode("utf-8"),
            )
            return self.document_repository.update(
                document,
                text_length=len(extracted_text),
                status=DocumentStatus.READY,
            )
        except Exception:
            # The upload itself succeeded — only extraction failed. We keep
            # the document row (status=FAILED) rather than deleting it, so
            # the user sees *why* it's unusable (in the UI's status badge)
            # instead of the upload silently disappearing.
            return self.document_repository.update(document, status=DocumentStatus.FAILED)

    def list_documents(self, *, user_id: uuid.UUID) -> list[Document]:
        return self.document_repository.list_for_user(user_id)

    def get_document(self, *, user_id: uuid.UUID, document_id: uuid.UUID) -> Document:
        return self._get_owned_document(user_id, document_id)

    def get_document_content(
        self, *, user_id: uuid.UUID, document_id: uuid.UUID
    ) -> tuple[Document, bytes]:
        document = self._get_owned_document(user_id, document_id)
        content = self.storage_service.read(document.storage_path)
        return document, content

    def delete_document(self, *, user_id: uuid.UUID, document_id: uuid.UUID) -> None:
        document = self._get_owned_document(user_id, document_id)
        self.storage_service.delete_document_folder(user_id=user_id, document_id=document.id)
        self.document_repository.delete(document)

    def _get_owned_document(self, user_id: uuid.UUID, document_id: uuid.UUID) -> Document:
        document = self.document_repository.get_by_id(document_id)
        # A document that exists but belongs to someone else returns the
        # exact same "not found" response as a document that doesn't exist
        # at all. Distinguishing the two (e.g. with a 403) would let a user
        # enumerate other people's document IDs by observing which ones
        # return "forbidden" vs "not found" — so both cases collapse to 404.
        if document is None or document.user_id != user_id:
            raise NotFoundException("Document not found")
        return document
