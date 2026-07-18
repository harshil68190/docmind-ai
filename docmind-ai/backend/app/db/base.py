"""
Declarative base for all ORM models.

This module intentionally contains no models itself. Every model module
(`app/models/*.py`) imports `Base` from here and registers itself against
it. Alembic's `env.py` imports this module (which, once models exist, will
import every model module) so that `Base.metadata` reflects the full schema
for autogeneration.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass
