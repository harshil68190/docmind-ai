"""
Application entrypoint.

Uses the "app factory" pattern (`create_application()`) rather than a bare
module-level `app = FastAPI()` so the app can be constructed multiple times
with different settings in tests, and so app assembly (middleware, routers,
exception handlers) lives in one auditable function instead of being
scattered across import-time side effects.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    AlreadyExistsException,
    DocMindException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.core.logging import configure_logging, get_logger

logger = get_logger(__name__)

# Maps each domain exception type to the HTTP status code it should produce.
# Declared as data rather than as a chain of if/elif so adding a new
# exception type later is a one-line change, not a branch to insert.
_EXCEPTION_STATUS_MAP: dict[type[DocMindException], int] = {
    NotFoundException: status.HTTP_404_NOT_FOUND,
    AlreadyExistsException: status.HTTP_409_CONFLICT,
    UnauthorizedException: status.HTTP_401_UNAUTHORIZED,
    ForbiddenException: status.HTTP_403_FORBIDDEN,
    ValidationException: status.HTTP_422_UNPROCESSABLE_ENTITY,
}


def create_application() -> FastAPI:
    configure_logging()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        debug=settings.DEBUG,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    )

    _register_middleware(app)
    _register_exception_handlers(app)
    _register_routers(app)

    return app


def _register_middleware(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def _register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DocMindException)
    async def domain_exception_handler(
        request: Request, exc: DocMindException
    ) -> JSONResponse:
        status_code = _EXCEPTION_STATUS_MAP.get(
            type(exc), status.HTTP_400_BAD_REQUEST
        )
        logger.warning(
            "%s: %s (path=%s)", type(exc).__name__, exc.message, request.url.path
        )
        return JSONResponse(
            status_code=status_code,
            content={"detail": exc.message, "error_type": type(exc).__name__},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception("Unhandled exception on path=%s", request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error", "error_type": "InternalError"},
        )


def _register_routers(app: FastAPI) -> None:
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", tags=["root"])
    def root() -> dict:
        return {
            "service": settings.PROJECT_NAME,
            "status": "running",
            "docs": f"{settings.API_V1_PREFIX}/docs",
        }


app = create_application()
