"""
Importing every model module here (rather than leaving this file empty)
guarantees they're registered against `Base.metadata` as soon as anything
imports `app.models` -- which is exactly what `alembic/env.py` does for
autogenerate discovery. A model that exists but is never imported anywhere
is invisible to Alembic even though it inherits from `Base`.
"""
from app.models.user import User  # noqa: F401
