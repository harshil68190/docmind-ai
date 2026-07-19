# DocMind AI — Enterprise Knowledge Assistant
## System Architecture Document (v1.0)

---

## 1. Executive Summary

DocMind AI is a multi-tenant, document-grounded conversational AI platform. Users upload
documents (PDF/DOCX/PPTX/TXT), the system ingests and indexes them into a vector store,
and users interact with their document corpus through a RAG-powered chat interface with
verifiable citations back to source pages.

The system is designed around three architectural principles:

1. **Separation of concerns** — every layer (API, service, repository, model) has exactly
   one reason to change.
2. **Swappable AI internals** — LLM provider, embedding model, and vector store are all
   accessed through interfaces, not concrete classes, so Gemini → OpenAI or FAISS → Qdrant
   is a config + adapter change, not a rewrite.
3. **Traceable retrieval** — nothing gets into a chat response without a citation trail
   back to `document_id → page_number → chunk_index`.

---

## 2. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                          │
│   React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui             │
│   TanStack Query (server state)  |  React Router (routing)           │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ HTTPS / REST (JSON)
                                 │ JWT Bearer Token
┌───────────────────────────────▼───────────────────────────────────────┐
│                         API GATEWAY LAYER                            │
│                 FastAPI (Routers / Controllers)                      │
│   /auth   /documents   /chat   /search   /dashboard   /compare       │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────────┐
│                          SERVICE LAYER                                │
│  AuthService | DocumentService | ChatService | RAGService             │
│  EmbeddingService | SummaryService | ComparisonService                │
│  UsageTrackingService                                                 │
└───────┬───────────────┬───────────────┬───────────────┬───────────────┘
        │               │               │               │
┌───────▼──────┐ ┌──────▼───────┐ ┌─────▼──────┐ ┌──────▼────────────┐
│ REPOSITORY   │ │ AI PROVIDERS │ │ VECTOR      │ │ FILE STORAGE       │
│ LAYER        │ │ (LangChain   │ │ STORE       │ │ (Local Disk /      │
│ SQLAlchemy   │ │ + Gemini)    │ │ (FAISS)     │ │ abstracted for S3) │
└───────┬──────┘ └──────────────┘ └────────────┘ └────────────────────┘
        │
┌───────▼───────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture — Layered Design

```
app/
├── main.py                        # FastAPI app factory, middleware registration
├── core/
│   ├── config.py                  # Pydantic Settings (env vars)
│   ├── security.py                # JWT encode/decode, password hashing
│   ├── dependencies.py            # get_current_user, get_db, DI wiring
│   ├── exceptions.py              # Custom exception hierarchy
│   └── logging.py                 # Structured logging config
│
├── api/
│   └── v1/
│       ├── router.py               # Aggregates all routers
│       └── endpoints/
│           ├── auth.py             # POST /register /login /refresh
│           ├── documents.py        # Upload/list/delete documents
│           ├── chat.py             # Chat sessions + messages
│           ├── search.py           # Semantic + keyword search
│           ├── dashboard.py        # Usage stats, storage metrics
│           └── insights.py         # Summary, FAQs, comparisons
│
├── models/                         # SQLAlchemy ORM models (DB tables)
│   ├── user.py
│   ├── document.py
│   ├── chunk.py
│   ├── conversation.py
│   ├── message.py
│   ├── citation.py
│   └── usage_log.py
│
├── schemas/                        # Pydantic request/response DTOs
│   ├── auth_schema.py
│   ├── document_schema.py
│   ├── chat_schema.py
│   └── search_schema.py
│
├── repositories/                   # Data access layer — ONLY place with raw queries
│   ├── base_repository.py          # Generic CRUD (SOLID: DRY + OCP)
│   ├── user_repository.py
│   ├── document_repository.py
│   ├── chunk_repository.py
│   └── conversation_repository.py
│
├── services/                       # Business logic — orchestrates repos + AI
│   ├── auth_service.py
│   ├── document_service.py         # Upload orchestration
│   ├── ingestion/
│   │   ├── extractor_service.py    # PDF/DOCX/PPTX/TXT → raw text
│   │   ├── chunking_service.py     # Text splitting strategy
│   │   └── embedding_service.py    # Text → vectors
│   ├── rag/
│   │   ├── retrieval_service.py    # Top-k semantic retrieval
│   │   ├── prompt_builder.py       # Context-aware prompt construction
│   │   ├── citation_service.py     # Maps LLM output → source chunks
│   │   └── rag_pipeline.py         # Orchestrates retrieval → generation
│   ├── chat_service.py             # Multi-turn conversation management
│   ├── search_service.py           # Semantic + keyword search
│   ├── insight_service.py          # Summary / FAQs / action items
│   ├── comparison_service.py       # Two-document diff/compare
│   └── usage_service.py            # Tracks tokens, storage, API calls
│
├── providers/                      # External AI provider adapters (interfaces!)
│   ├── llm/
│   │   ├── base_llm_provider.py    # Abstract interface
│   │   └── gemini_provider.py      # Concrete Gemini implementation
│   ├── embeddings/
│   │   ├── base_embedding_provider.py
│   │   └── sentence_transformer_provider.py
│   └── vectorstore/
│       ├── base_vector_store.py
│       └── faiss_vector_store.py
│
├── storage/
│   ├── base_storage.py             # Interface: save/get/delete file
│   └── local_storage.py            # Local disk implementation
│
├── utils/
│   ├── file_validator.py
│   ├── text_cleaner.py
│   └── token_counter.py
│
└── db/
    ├── session.py                   # Engine + session factory
    └── base.py                      # Declarative base import hub

alembic/
├── versions/
└── env.py
```

### Why this structure (SOLID mapping)

| Principle | How it's applied |
|---|---|
| **S**ingle Responsibility | `extractor_service.py` only extracts text; `chunking_service.py` only chunks; `embedding_service.py` only embeds. None of them know about HTTP or the DB. |
| **O**pen/Closed | `base_llm_provider.py` / `base_vector_store.py` are abstract. Adding a new provider = new file, zero changes to `rag_pipeline.py`. |
| **L**iskov Substitution | Any `BaseVectorStore` implementation (FAISS today, Qdrant tomorrow) is interchangeable in `retrieval_service.py`. |
| **I**nterface Segregation | Repositories expose only the methods a given service needs (no fat "God repository"). |
| **D**ependency Inversion | Services depend on repository/provider **interfaces** injected via FastAPI's `Depends()`, not concrete classes — this is what makes the whole thing unit-testable with mocks. |

---

## 4. Database Schema (PostgreSQL)

### Entity-Relationship Diagram

```
┌────────────────┐        ┌──────────────────────┐        ┌────────────────┐
│     users       │        │      documents        │        │     chunks      │
├────────────────┤        ├──────────────────────┤        ├────────────────┤
│ id (PK)         │◄──────┤ id (PK)                │◄──────┤ id (PK)         │
│ email           │  1:N   │ user_id (FK)           │  1:N   │ document_id(FK) │
│ hashed_password │        │ filename               │        │ content         │
│ full_name       │        │ file_type              │        │ chunk_index     │
│ role            │        │ file_path              │        │ page_number     │
│ created_at      │        │ status (enum)          │        │ char_start      │
└────────────────┘        │ storage_size_bytes      │        │ char_end        │
        │                  │ created_at              │        │ embedding_id    │
        │                  └──────────────────────┘        │ created_at      │
        │                                                    └────────────────┘
        │ 1:N
        ▼
┌────────────────────┐        ┌──────────────────────┐
│   conversations      │        │      messages          │
├────────────────────┤        ├──────────────────────┤
│ id (PK)              │◄──────┤ id (PK)                │
│ user_id (FK)          │  1:N   │ conversation_id (FK)   │
│ title                 │        │ role (user/assistant)  │
│ document_scope (JSON) │        │ content                │
│ created_at            │        │ token_count             │
│ updated_at            │        │ created_at              │
└────────────────────┘        └───────────┬──────────┘
                                             │ 1:N
                                             ▼
                                   ┌──────────────────┐
                                   │    citations       │
                                   ├──────────────────┤
                                   │ id (PK)            │
                                   │ message_id (FK)    │
                                   │ chunk_id (FK)       │
                                   │ document_id (FK)    │
                                   │ page_number         │
                                   │ relevance_score     │
                                   └──────────────────┘

┌──────────────────────┐
│      usage_logs         │
├──────────────────────┤
│ id (PK)                │
│ user_id (FK)            │
│ action_type (enum)      │  -- UPLOAD | CHAT | SUMMARY | COMPARE | SEARCH
│ tokens_used             │
│ metadata (JSONB)        │
│ created_at              │
└──────────────────────┘
```

### Table Notes

- **`documents.status`** — enum: `UPLOADED → PROCESSING → INDEXED → FAILED`. This state
  machine drives the frontend's polling/progress UI and is the backbone of async ingestion.
- **`chunks.embedding_id`** — a string key referencing the vector's position in the FAISS
  index (FAISS itself stores no metadata, so Postgres is the source of truth; FAISS is
  purely a similarity-search accelerator).
- **`conversations.document_scope`** — JSON array of document IDs the conversation is
  scoped to. Supports both "chat with one doc" and "chat across my whole workspace."
- **`citations`** is a first-class table, not a JSON blob on `messages` — this lets us
  query "which documents get cited most" for the dashboard, and keeps citation data
  normalized and relationally sound.
- **`usage_logs`** powers the dashboard's AI usage statistics and (later) rate-limiting/
  quota enforcement — a genuinely enterprise concern, not decoration.

---

## 5. API Design (REST, v1)

All endpoints are prefixed `/api/v1`. All except `/auth/*` require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Obtain access + refresh token |
| POST | `/auth/refresh` | Rotate access token |
| GET  | `/auth/me` | Current user profile |
| POST | `/documents/upload` | Upload file → triggers async ingestion pipeline |
| GET  | `/documents` | List user's documents (paginated, filterable by status) |
| GET  | `/documents/{id}` | Document detail + processing status |
| DELETE | `/documents/{id}` | Delete document + cascade chunks/vectors |
| GET  | `/documents/{id}/status` | Poll ingestion progress |
| POST | `/chat/conversations` | Start a new conversation (optionally scoped to docs) |
| GET  | `/chat/conversations` | List conversation history |
| GET  | `/chat/conversations/{id}` | Full message history for a conversation |
| POST | `/chat/conversations/{id}/messages` | Send a message → RAG pipeline → streamed response |
| DELETE | `/chat/conversations/{id}` | Delete a conversation |
| POST | `/search/semantic` | Vector similarity search across corpus |
| POST | `/search/keyword` | Postgres full-text search fallback |
| POST | `/insights/summary/{document_id}` | Generate summary + key takeaways |
| POST | `/insights/action-items/{document_id}` | Extract action items |
| POST | `/insights/faqs/{document_id}` | Auto-generate FAQs |
| POST | `/insights/explain` | Explain a highlighted/difficult section |
| POST | `/insights/compare` | Compare two documents (body: `{doc_id_a, doc_id_b}`) |
| GET  | `/dashboard/overview` | Storage usage, doc count, chat count, AI usage stats |

**Design notes:**
- Chat responses use **Server-Sent Events (SSE)** streaming (`text/event-stream`), not
  polling — this is expected UX for any modern AI product and is a good interview talking
  point (backpressure, partial-token rendering, abort handling).
- Upload is **fire-and-forget with polling** (`status` field), not a blocking request —
  extraction + embedding of a 50-page PDF should never hold an HTTP connection open.

---

## 6. Authentication Flow

```
┌────────┐                       ┌────────┐                      ┌──────────┐
│ Client │                       │ FastAPI │                      │ Postgres │
└───┬────┘                       └────┬───┘                      └────┬─────┘
    │  POST /auth/register             │                               │
    │  {email, password, full_name}    │                               │
    ├──────────────────────────────────►                               │
    │                                   │  bcrypt.hash(password)        │
    │                                   ├───────────────────────────────►
    │                                   │  INSERT user                  │
    │                                   ◄───────────────────────────────┤
    │  201 {user_id, email}             │                               │
    ◄──────────────────────────────────┤                               │
    │                                   │                               │
    │  POST /auth/login                 │                               │
    │  {email, password}                │                               │
    ├──────────────────────────────────►                               │
    │                                   │  verify bcrypt hash            │
    │                                   │  issue JWT (access, 15m)       │
    │                                   │  issue JWT (refresh, 7d)       │
    │  200 {access_token, refresh_token}│                               │
    ◄──────────────────────────────────┤                               │
    │                                   │                               │
    │  GET /documents                   │                               │
    │  Authorization: Bearer <access>   │                               │
    ├──────────────────────────────────►                               │
    │                       decode_jwt() → user_id                      │
    │                       (via get_current_user dependency)           │
    │  200 [...]                        │                               │
    ◄──────────────────────────────────┤                               │
```

- Passwords hashed with **bcrypt** (via `passlib`).
- **Access token**: short-lived (15 min), carries `user_id`, `role`, `exp`.
- **Refresh token**: long-lived (7 days), stored client-side (httpOnly cookie
  recommended over localStorage — we'll implement it that way for the security story).
- `get_current_user` is a FastAPI dependency injected into every protected route —
  this is where role-based access (e.g., admin dashboards) will hook in later.

---

## 7. RAG Pipeline — End to End

### 7.1 Ingestion Pipeline (on upload)

```
Upload File
    │
    ▼
[1] File Validation (type, size, virus-scan placeholder)
    │
    ▼
[2] Persist raw file → Local Storage (path saved in `documents.file_path`)
    │
    ▼
[3] Extractor Service (format-specific)
    - PDF  → pypdf / pdfplumber (page-level text + page numbers preserved)
    - DOCX → python-docx
    - PPTX → python-pptx (slide number = page_number)
    - TXT  → raw read
    │
    ▼
[4] Chunking Service
    - Recursive character/token-aware splitting (LangChain RecursiveCharacterTextSplitter)
    - Chunk size ~500-800 tokens, ~15% overlap
    - Each chunk retains: document_id, page_number, chunk_index, char_start/end
    │
    ▼
[5] Embedding Service
    - Sentence-Transformers (all-MiniLM-L6-v2 or bge-small) → 384/768-dim vectors
    - Batched for throughput
    │
    ▼
[6] Vector Store Write
    - FAISS IndexFlatIP (cosine via normalized vectors) — per-user or global index
      with metadata filtering by user_id
    - Chunk metadata (text, page, doc_id) persisted in Postgres `chunks` table
    - FAISS index persisted to disk, reloaded on startup
    │
    ▼
[7] Status Update → documents.status = 'INDEXED'
```

### 7.2 Query / Chat Pipeline (on message)

```
User Question
    │
    ▼
[1] Embed query (same embedding model as ingestion — critical consistency requirement)
    │
    ▼
[2] Retrieval Service
    - FAISS top-k similarity search (k=5-8), filtered to conversation's document_scope
    - Optional: re-ranking pass (cross-encoder) — Phase 2 enhancement
    │
    ▼
[3] Prompt Builder
    - System prompt: role, tone, "answer only from context, cite sources"
    - Injects retrieved chunks labeled [Source 1], [Source 2]... with doc name + page
    - Injects last N turns of conversation history (sliding window)
    │
    ▼
[4] LLM Generation (Gemini via LangChain)
    - Streamed token-by-token back to client via SSE
    │
    ▼
[5] Citation Service
    - Parses which [Source N] markers the model actually used
    - Maps back to chunk_id → document_id → page_number
    - Persists to `citations` table, linked to the `message`
    │
    ▼
[6] Response returned with inline citation markers + source panel data
    │
    ▼
[7] Usage Service logs token count → `usage_logs`
```

### Sequence Diagram — Chat with Citation

```
Client        FastAPI        RAGService      VectorStore      Gemini      Postgres
  │  POST msg    │                │                │              │           │
  ├─────────────►│                │                │              │           │
  │              │ retrieve(q)     │                │              │           │
  │              ├───────────────►│                │              │           │
  │              │                │ search(vec,k=6) │              │           │
  │              │                ├───────────────►│              │           │
  │              │                │◄───────────────┤              │           │
  │              │                │  chunks[6]      │              │           │
  │              │  build_prompt() │                │              │           │
  │              │                │                │  generate()   │           │
  │              │                ├─────────────────────────────►│           │
  │◄═══════════════════════ SSE token stream ════════════════════┤           │
  │              │                │                │              │           │
  │              │                │ resolve_citations()            │           │
  │              │                ├────────────────────────────────────────►│
  │              │                │◄────────────────────────────────────────┤
  │  final msg + citations         │                │              │           │
  ◄─────────────┤                │                │              │           │
```

---

## 8. Frontend Architecture

```
src/
├── main.tsx
├── App.tsx                       # Router root
├── routes/
│   ├── auth/ (Login, Register)
│   ├── dashboard/ (Overview)
│   ├── documents/ (List, Upload, Detail)
│   ├── chat/ (ConversationList, ChatWindow)
│   └── insights/ (Summary, Compare)
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (button, dialog, etc.)
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── CitationPanel.tsx     # Shows source chunks + page refs, click-to-scroll
│   │   └── ChatInput.tsx
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   ├── UploadDropzone.tsx
│   │   └── ProcessingStatusBadge.tsx
│   └── layout/ (Sidebar, Topbar, ProtectedRoute)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDocuments.ts           # TanStack Query hooks wrapping API calls
│   ├── useChat.ts                # Handles SSE streaming state
│   └── useDashboardStats.ts
│
├── api/
│   ├── client.ts                 # Axios instance, interceptors (JWT attach, refresh)
│   ├── auth.api.ts
│   ├── documents.api.ts
│   └── chat.api.ts
│
├── stores/                       # Zustand (lightweight, not Redux — justified below)
│   └── authStore.ts
│
├── types/                        # Shared TS interfaces mirroring backend Pydantic schemas
│
└── lib/
    └── utils.ts
```

**Key decisions:**
- **TanStack Query owns all server state** (documents, chats, dashboard stats) —
  caching, revalidation, and optimistic updates on upload/delete come for free.
- **Zustand** (small addition beyond your listed stack) only for *client* state like
  auth token/current user — avoids Redux boilerplate for a project this size; if you'd
  rather stay strictly to the stack you listed, `Context + useReducer` is a drop-in
  substitute and I'll use that instead — your call.
- **SSE consumption** via `EventSource`/`fetch` streaming reader inside `useChat.ts`,
  so the chat UI renders tokens as they arrive, matching ChatGPT-grade UX.

---

## 9. Technology Justification

| Choice | Why |
|---|---|
| **FastAPI over Django/Flask** | Native async, Pydantic validation baked in, auto OpenAPI docs — the *de facto* standard for AI backends in 2025-26 job postings. |
| **PostgreSQL** | Relational integrity for users/documents/citations + native full-text search (`tsvector`) gives us keyword search without a second engine. |
| **FAISS** | Industry-standard for local/self-hosted vector search; demonstrates you understand indexing internals (IVF, HNSW, flat) rather than just calling a managed API. |
| **Sentence-Transformers** | Free, local, no per-embedding API cost during development; swappable with Gemini embeddings via the provider interface if you want an all-Gemini stack later. |
| **LangChain** | Standardizes prompt templates, output parsing, and provider abstraction — but we're using it as a *toolkit*, not letting it own our architecture (services stay framework-agnostic where it matters). |
| **Google Gemini** | Strong long-context + multimodal story, generous free tier for a portfolio demo, and distinct from "everyone uses OpenAI" on a resume. |
| **Alembic** | Versioned schema migrations — non-negotiable for anything you'd call "production-quality." |
| **Docker Compose** | One-command spin-up (`db + backend + frontend`) — this alone signals deployment maturity to a reviewer skimming your GitHub. |

---

## 10. Non-Functional Considerations (flagged for later milestones)

- **Rate limiting** — `usage_logs` table already gives us the data to enforce per-user quotas.
- **Multi-tenancy isolation** — every query is scoped by `user_id`; FAISS index will be
  partitioned/filterable by user to prevent cross-tenant leakage.
- **Observability** — structured logging from day one (`core/logging.py`) so we can add
  request tracing without retrofitting.
- **Testing** — repository/service split exists specifically so we can unit test business
  logic with mocked repositories and provider interfaces, no live DB/API needed.

---

## 11. Build Order (proposed milestones)

1. **Milestone 1** — Project scaffolding: Docker Compose, FastAPI skeleton, Postgres,
   Alembic, base config/env setup.
2. **Milestone 2** — Auth (register/login/JWT) end-to-end, frontend login/register pages.
3. **Milestone 3** — Document upload + extraction + chunking (no embeddings yet) —
   verify the ingestion state machine works.
4. **Milestone 4** — Embeddings + FAISS + retrieval — verify semantic search in isolation.
5. **Milestone 5** — Full RAG chat pipeline with streaming + citations.
6. **Milestone 6** — Dashboard, usage stats, search endpoints.
7. **Milestone 7** — Additional AI features (summary, FAQs, compare, explain).
8. **Milestone 8** — Polish: error handling, loading states, deployment hardening.

---

*End of Architecture Document v1.0 — awaiting confirmation to begin Milestone 1.*
