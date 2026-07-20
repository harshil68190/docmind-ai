"""
Domain exception hierarchy.

Services and repositories raise these instead of raw HTTPException, which
keeps business logic free of any knowledge of HTTP status codes. The API
layer (see `main.py` exception handlers) is the only place that translates
a domain exception into an HTTP response. This is what lets `services/` be
reused later outside of a FastAPI request context (e.g. a background worker)
without dragging HTTP concerns along with it.
"""


class DocMindException(Exception):
    """Base class for all application-specific exceptions."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundException(DocMindException):
    """Raised when a requested resource does not exist."""


class AlreadyExistsException(DocMindException):
    """Raised when attempting to create a resource that already exists."""


class UnauthorizedException(DocMindException):
    """Raised when authentication credentials are missing or invalid."""


class ForbiddenException(DocMindException):
    """Raised when an authenticated user lacks permission for an action."""


class ValidationException(DocMindException):
    """Raised when input fails a business-rule validation check."""


class UnsupportedFileTypeException(DocMindException):
    """Raised when an uploaded file's extension is not one DocMind supports."""


class FileTooLargeException(DocMindException):
    """Raised when an uploaded file exceeds the configured size limit."""


class ExtractionFailedException(DocMindException):
    """Raised when text extraction from an otherwise-valid file fails."""


class GenerationFailedException(DocMindException):
    """Raised when the LLM provider fails to generate an answer."""
