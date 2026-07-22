"""
Document endpoints.

Every handler is a thin adapter over `DocumentService` — no business logic
lives here. `download_document` is the one addition beyond the milestone's
literal endpoint list (upload/list/get/delete): the frontend requirement
for a working download button can't be satisfied client-side without a
server route, since `storage_path` is never exposed to the client (see
`schemas/document_schema.py`) and there's no static file server in front
of `storage/uploads/`.
"""
import uuid

from fastapi import APIRouter, Depends, File, Response, UploadFile, status

from app.core.config import settings
from app.core.dependencies import get_current_active_user, get_document_service
from app.core.exceptions import FileTooLargeException
from app.models.document import Document
from app.models.user import User
from app.schemas.document_schema import DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document (PDF, DOCX, PPTX, or TXT — max 20MB)",
)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    document_service: DocumentService = Depends(get_document_service),
) -> Document:
    # Read bounded to max_size + 1 byte: this caps memory usage at just
    # over the limit regardless of how large the actual uploaded file is,
    # rather than reading an arbitrarily large body into memory before
    # checking its size.
    max_bytes = settings.max_upload_size_bytes
    content = file.file.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise FileTooLargeException(
            f"File exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    return document_service.upload_document(
        user_id=current_user.id,
        original_filename=file.filename or "untitled",
        content=content,
    )


@router.get("")
def list_documents(
    current_user: User = Depends(get_current_active_user),
):
    return {
        "ok": True,
        "user_id": str(current_user.id)
    }


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get a single document's metadata",
)
def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    document_service: DocumentService = Depends(get_document_service),
) -> Document:
    return document_service.get_document(user_id=current_user.id, document_id=document_id)


@router.get(
    "/{document_id}/download",
    summary="Download the original uploaded file",
)
def download_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    document_service: DocumentService = Depends(get_document_service),
) -> Response:
    document, content = document_service.get_document_content(
        user_id=current_user.id, document_id=document_id
    )
    return Response(
        content=content,
        media_type=document.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{document.original_filename}"'},
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document and its stored files",
)
def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    document_service: DocumentService = Depends(get_document_service),
) -> None:
    document_service.delete_document(user_id=current_user.id, document_id=document_id)
