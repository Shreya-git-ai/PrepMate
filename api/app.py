
"""
PrepMate FastAPI backend.

Connects:
PDF ingestion -> topic tagging -> ChromaDB
Question -> RAG answer
Topic -> Quiz generation
Quiz result -> Mastery tracking
"""

import os

from fastapi import FastAPI  # type: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[reportMissingImports]

from api.database import Base, engine
from api.exceptions import register_exception_handlers
from api.routers import auth, ingestion, qna, quiz, mastery

# NOTE: create_all() sirf dev convenience ke liye hai.
# Phase 7 (Alembic) ke baad iski jagah migrations use honge.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrepMate API")

# Frontend (Vite dev server) se requests allow karne ke liye.
# Production mein FRONTEND_URL .env se aayega (Vercel/Netlify URL).
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(qna.router)
app.include_router(quiz.router)
app.include_router(mastery.router)


@app.get("/")
def home():
    return {"message": "Prepmate API"}