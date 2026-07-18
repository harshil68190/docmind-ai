"""
Database engine and session factory.

A single `Engine` is created per process and reused (this is the SQLAlchemy-
recommended pattern — engines manage a connection pool internally, so
creating one per request would defeat pooling entirely). `SessionLocal` is a
factory for short-lived, per-request `Session` objects, handed out via the
`get_db` dependency in `core/dependencies.py`.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # detects and discards stale connections before use
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)
