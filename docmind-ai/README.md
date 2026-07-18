# DocMind AI — Enterprise Knowledge Assistant

A production-architected Retrieval-Augmented Generation (RAG) platform for
document-grounded conversational AI, with citation tracking, semantic
search, and multi-format document ingestion.

> **Status:** Milestone 2 — Authentication & User Management. Document
> upload and RAG are not implemented yet.

Full architecture — folder structure, DB schema, API design, RAG pipeline,
sequence diagrams — is in [`DocMind_AI_Architecture.md`](./DocMind_AI_Architecture.md).

## Tech Stack

**Backend:** FastAPI · SQLAlchemy · Alembic · PostgreSQL · Pydantic Settings
**Frontend:** React 18 · TypeScript · Vite · TailwindCSS · shadcn/ui · TanStack Query · React Router · Zustand
**Infra:** Docker · Docker Compose

## Project Structure

```
docmind-ai/
├── backend/            # FastAPI application
│   ├── app/
│   │   ├── core/        # config, logging, DI, exceptions
│   │   ├── api/v1/       # routers + endpoints
│   │   ├── db/           # engine, session, declarative base
│   │   ├── models/       # SQLAlchemy models (added from Milestone 2)
│   │   ├── schemas/      # Pydantic DTOs (added from Milestone 2)
│   │   ├── repositories/ # data access layer (added from Milestone 2)
│   │   ├── services/     # business logic (added from Milestone 2)
│   │   └── providers/    # LLM/embedding/vector-store adapters (Milestone 4+)
│   ├── alembic/          # DB migrations
│   └── requirements.txt
├── frontend/            # React + Vite application
│   └── src/
│       ├── routes/        # page components
│       ├── components/    # layout + shadcn/ui primitives
│       ├── api/           # HTTP client + API modules
│       ├── stores/        # Zustand client-state stores
│       └── lib/            # utilities, query client
├── docker-compose.yml
└── .env.example
```

## Option A — Run with Docker Compose (recommended)

**Prerequisites:** Docker + Docker Compose installed.

```bash
# 1. Copy and fill in environment variables
cp .env.example .env
# Generate a real SECRET_KEY:
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Paste the output into SECRET_KEY in .env

# 2. Build and start everything (postgres + backend + frontend)
docker compose up --build

# 3. Verify
# API:      http://localhost:8000/
# API docs: http://localhost:8000/api/v1/docs
# Health:   http://localhost:8000/api/v1/health
# Frontend: http://localhost:5173
```

Stop with `docker compose down`. Add `-v` to also drop the Postgres volume.

## Option B — Run locally without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example ../.env         # if not already created
# Ensure POSTGRES_HOST=localhost and that Postgres is running locally,
# e.g. via: docker run -d -p 5432:5432 \
#   -e POSTGRES_USER=docmind -e POSTGRES_PASSWORD=docmind \
#   -e POSTGRES_DB=docmind_db postgres:16-alpine

# Apply migrations (none exist yet in Milestone 1 — this becomes relevant
# from Milestone 2 onward, listed here so the workflow is established)
alembic upgrade head

uvicorn app.main:app --reload
```

Backend env vars are read from `../.env` at the repo root by default (via
`pydantic-settings`'s `env_file` config) — run `uvicorn` from the `backend/`
directory with a `.env` present either there or one level up.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`.

## Database Migrations (Alembic)

```bash
cd backend

# Generate a migration from model changes
alembic revision --autogenerate -m "description of change"

# Apply pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```

## Smoke Tests

With the backend running:

```bash
curl http://localhost:8000/
# {"service":"DocMind AI","status":"running","docs":"/api/v1/docs"}

curl http://localhost:8000/api/v1/health
# {"status":"ok","database":"up"}
```

With the frontend running, visiting `http://localhost:5173/` should redirect
to `/dashboard`, which redirects to `/login` (no session exists yet — auth
lands in Milestone 2).

## Authentication (Milestone 2)

JWT-based auth with access + refresh tokens. See `backend/app/services/auth_service.py`
for the business logic and `frontend/src/hooks/useAuth.ts` for the client side.

**Endpoints** (`/api/v1/auth/*`): `POST /register`, `POST /login`, `GET /me`,
`POST /refresh`, `POST /logout`.

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","full_name":"Jane Doe","password":"Password123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Password123"}'
# -> {"access_token":"...","refresh_token":"...","token_type":"bearer","expires_in":900}

# Call a protected endpoint
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"

# Refresh
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token>"}'
```

**Swagger UI:** open `http://localhost:8000/api/v1/docs`, call `/auth/login`,
copy `access_token` from the response, click **Authorize**, paste the token
(no `Bearer ` prefix needed — the UI adds it), then any protected endpoint
in the docs will use it automatically.

## Roadmap

1. ✅ **Milestone 1** — Project foundation
2. ✅ **Milestone 2** — Authentication (JWT, register/login)
3. Milestone 3 — Document upload, extraction, chunking
4. Milestone 4 — Embeddings + FAISS + retrieval
5. Milestone 5 — Full RAG chat pipeline with streaming + citations
6. Milestone 6 — Dashboard, usage stats, search
7. Milestone 7 — Summary / FAQs / compare / explain
8. Milestone 8 — Polish + deployment hardening
