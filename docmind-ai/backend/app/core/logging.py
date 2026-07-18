"""
Logging configuration.

Uses stdlib `logging` with a structured, single-line format that's easy to
grep locally and easy to ingest into a log aggregator (ELK/CloudWatch/etc.)
later without changing the format again. Configured once at app startup via
`configure_logging()`.
"""
import logging
import sys

from app.core.config import settings

LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
)


def configure_logging() -> None:
    level = logging.DEBUG if settings.DEBUG else logging.INFO

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if this is called more than once (e.g. tests)
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt="%Y-%m-%d %H:%M:%S"))
    root_logger.addHandler(handler)

    # Quiet down noisy third-party loggers in normal operation
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
