"""
Alembic migration environment.

Deliberately imports `settings` (not `os.environ`) for the database URL, so
migrations always use the exact same validated configuration as the running
application — there's no way for the app and its migrations to point at
different databases due to an env var typo.

`target_metadata` is `Base.metadata`. As models are added under
`app/models/`, they must be imported below so Alembic's `--autogenerate`
can see them; a model that's never imported here is invisible to autogenerate
even though it's a real table in the ORM.
"""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.db.base import Base

# --- Model imports for autogenerate discovery ---
# Importing the models package registers every model against
# `Base.metadata`; without this import, autogenerate would see an empty
# schema even though the models exist in code.
from app.models import user, document  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Generate SQL scripts without a live DB connection (`alembic upgrade --sql`)."""
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live DB connection — the normal path."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
