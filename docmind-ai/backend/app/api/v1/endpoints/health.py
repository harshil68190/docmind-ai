"""
Health check endpoint.

Distinct from `/` (which just confirms the process is up): this endpoint
also verifies the database connection is alive, so it doubles as the
Docker Compose healthcheck target and an early warning if Postgres is
unreachable. Kept intentionally lightweight — no auth, no heavy queries.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)) -> dict:
    db_status = "up"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - health check must not raise
        logger.error("Database health check failed: %s", exc)
        db_status = "down"

    return {
        "status": "ok" if db_status == "up" else "degraded",
        "database": db_status,
    }
