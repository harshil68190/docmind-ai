"""
API v1 router aggregator.

Every future endpoint module (auth, documents, chat, search, dashboard,
insights) registers itself here with an `include_router` call. `main.py`
only ever needs to know about this single `api_router` — it stays untouched
as the API surface grows, satisfying Open/Closed at the app-assembly level.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, documents, health

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(health.router, tags=["health"])
