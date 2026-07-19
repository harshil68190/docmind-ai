"""
Upload validation helpers.

Pure functions with no I/O — kept separate from `DocumentService` so the
"what files are we willing to accept" policy can be unit tested in
isolation and reused anywhere else that needs it later (e.g. a bulk-import
feature) without depending on the service's repository/storage
dependencies.
"""
from app.core.exceptions import FileTooLargeException, UnsupportedFileTypeException, ValidationException

ALLOWED_EXTENSIONS: dict[str, str] = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".txt": "text/plain",
}


def validate_extension(filename: str) -> str:
    extension = f".{filename.rsplit('.', 1)[-1].lower()}" if "." in filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ext.lstrip(".").upper() for ext in ALLOWED_EXTENSIONS))
        raise UnsupportedFileTypeException(
            f"'{extension or 'unknown'}' is not a supported file type. Allowed types: {allowed}."
        )
    return extension


def resolve_mime_type(extension: str) -> str:
    return ALLOWED_EXTENSIONS[extension]


def validate_size(size_bytes: int, max_size_bytes: int) -> None:
    if size_bytes == 0:
        raise ValidationException("Uploaded file is empty.")
    if size_bytes > max_size_bytes:
        raise FileTooLargeException(
            f"File exceeds the maximum allowed size of {max_size_bytes // (1024 * 1024)}MB."
        )
