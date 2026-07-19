"""
Document schemas.

`DocumentResponse` excludes `storage_path` (an internal filesystem detail
that must never leave the server — see the security requirement in the
milestone spec) and `filename` (the sanitized on-disk name; the user only
ever needs to see `original_filename`). `user_id` is also excluded since
every response is already scoped to the authenticated caller.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    original_filename: str
    file_extension: str
    mime_type: str
    file_size: int
    status: DocumentStatus
    text_length: int | None
    created_at: datetime
    updated_at: datetime
