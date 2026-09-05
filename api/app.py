
"""
PrepMate FastAPI backend.

Connects:
PDF ingestion -> topic tagging -> ChromaDB
Question -> RAG answer
Topic -> Quiz generation
Quiz result -> Mastery tracking
"""

from fastapi import FastAPI

from api.database import Base, engine
from api.exceptions import register_exception_handlers
from api.routers import auth, ingestion, qna, quiz, mastery

# NOTE: create_all() sirf dev convenience ke liye hai.
# Phase 7 (Alembic) ke baad iski jagah migrations use honge.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrepMate API")

register_exception_handlers(app)

app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(qna.router)
app.include_router(quiz.router)
app.include_router(mastery.router)


@app.get("/")
def home():
    return {"message": "Prepmate API"}