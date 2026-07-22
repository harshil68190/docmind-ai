# DocMind AI

> **Enterprise-grade AI Document Assistant built with FastAPI, React, FAISS, LangChain, and Groq.**

DocMind AI is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents and ask natural language questions about them. Instead of relying solely on an LLM's general knowledge, the application retrieves relevant information from uploaded documents using semantic search and generates grounded answers with page-level citations.

---

## Features

- JWT Authentication (Register/Login)
- Secure PDF Upload & Management
- Automatic PDF Text Extraction
- Intelligent Document Chunking
- Semantic Search using Sentence Transformers + FAISS
- AI-powered Question Answering using Groq LLM
- Page-level Source Citations
- Modern Chat Interface
- User-isolated document indexes for privacy

---

## System Architecture

```text
                 ┌─────────────────────┐
                 │      React UI       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ FastAPI Backend API │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
  Authentication     Document Upload      Chat API
          │                 │                 │
          ▼                 ▼                 ▼
    PostgreSQL       PDF Extraction      RAG Pipeline
                                              │
                                              ▼
                                      Chunk Documents
                                              │
                                              ▼
                                  Generate Embeddings
                                              │
                                              ▼
                                      FAISS Vector DB
                                              │
                                              ▼
                                    Semantic Retrieval
                                              │
                                              ▼
                                          Groq LLM
                                              │
                                              ▼
                                  Answer + Source Citations
```

---

# Demo

*(Add screenshots here)*

### Login

<img src="docs/login.png" width="800"/>

### Upload Documents

<img src="docs/upload.png" width="800"/>

### Ask Questions

<img src="docs/chat.png" width="800"/>

### Answers with Citations

<img src="docs/citations.png" width="800"/>

---

# Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Zustand
- TanStack Query
- shadcn/ui

## Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic

## AI Stack

- LangChain
- Groq LLM
- Sentence Transformers
- FAISS
- RecursiveCharacterTextSplitter

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/<your-username>/docmind-ai.git
cd docmind-ai
```

---

## 2. Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

---

## 3. Frontend

```bash
cd frontend
npm install
```

---

## 4. Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=

SECRET_KEY=

GROQ_API_KEY=

GROQ_MODEL_NAME=

ACCESS_TOKEN_EXPIRE_MINUTES=

REFRESH_TOKEN_EXPIRE_DAYS=
```

---

## 5. Database

```bash
cd backend

alembic upgrade head
```

---

## 6. Run Backend

```bash
uvicorn app.main:app --reload
```

---

## 7. Run Frontend

```bash
cd frontend

npm run dev
```

---

# How It Works

1. User uploads a PDF.
2. Text is extracted from the document.
3. The document is split into manageable chunks.
4. Each chunk is converted into vector embeddings.
5. Embeddings are stored in a FAISS vector database.
6. When a question is asked:
   - Relevant chunks are retrieved using semantic search.
   - Retrieved context is passed to Groq.
   - The AI generates a grounded response.
   - Source citations are returned with page numbers.

---

# Security

- JWT Authentication
- User-specific document storage
- User-specific FAISS indexes
- Protected API endpoints
- Password hashing using secure algorithms

---

# Project Structure

```text
docmind-ai/
│
├── backend/
│   ├── app/
│   ├── alembic/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── docs/
├── docker-compose.yml
└── README.md
```

---

# Current Limitations

- Supports text-based PDFs only (OCR for scanned PDFs is not implemented).
- Responses are currently returned as complete messages (streaming responses are planned).
- Conversation history is maintained only for the current browser session.

---

# Future Improvements

- Streaming AI responses
- OCR support for scanned documents
- Conversation history persistence
- Hybrid retrieval (BM25 + Vector Search)
- Docker deployment
- Cloud deployment
- Multi-file comparison
- AI-generated summaries and FAQs

---

# Documentation

Detailed architecture, database design, and implementation notes are available in:

**`DocMind_AI_Architecture.md`**

---

# Author

**Harshil Arora**

B.Tech Artificial Intelligence & Data Science

GitHub: https://github.com/harshil68190
LinkedIn: https://linkedin.com/in/harshil-arora-b7a9082a4/

---