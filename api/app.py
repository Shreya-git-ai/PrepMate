"""
PrepMate FastAPI backend.

Connects:
PDF ingestion -> topic tagging -> ChromaDB
Question -> RAG answer
Topic -> Quiz generation
Quiz result -> Mastery tracking
"""

from fastapi import FastAPI

app=FastAPI()

@app.get("/")
def home():
    return {"message": "Prepmate API"}
