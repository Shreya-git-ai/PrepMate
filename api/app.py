"""
PrepMate FastAPI backend.

Connects:
PDF ingestion -> topic tagging -> ChromaDB
Question -> RAG answer
Topic -> Quiz generation
Quiz result -> Mastery tracking
"""

import shutil
from pathlib import Path
from typing import List

import chromadb
from chromadb.utils import embedding_functions

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingestion.chunker import chunk_pdf
from ingestion.topic_tagger import (
    tag_chunks_batch,
    topics_to_metadata_string
)

from RAG.generator import generate_answer
from RAG.quiz_generator import generate_quiz

from Tracking.mastery_tracker import (
    get_all_mastery,
    get_weak_topics,
    record_quiz_session
)


# ============================================================
# APP SETUP
# ============================================================

app = FastAPI(title="PrepMate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# PATHS / CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_RAW_DIR = BASE_DIR / "data" / "raw"

VECTORSTORE_PATH = "./vectorstore"

COLLECTION_NAME = "prepmate"

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"


# ============================================================
# CHROMA
# ============================================================

def get_collection():

    client = chromadb.PersistentClient(
        path=VECTORSTORE_PATH
    )

    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBED_MODEL_NAME
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embed_fn
    )

    return collection


# ============================================================
# REQUEST MODELS
# ============================================================

class AskRequest(BaseModel):
    question: str
    n_results: int = 3


class QuizGenerateRequest(BaseModel):
    topic: str
    num_questions: int = 5


class QuizResultItem(BaseModel):
    question: str
    is_correct: bool


class QuizSubmitRequest(BaseModel):
    topic: str
    results: List[QuizResultItem]


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def health_check():

    return {
        "status": "ok",
        "service": "PrepMate API"
    }


# ============================================================
# PDF UPLOAD / INGESTION
# ============================================================

@app.post("/upload")
async def upload_pdfs(
    files: List[UploadFile] = File(...)
):

    DATA_RAW_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    saved_paths = []

    # --------------------------------------------------------
    # 1. Save uploaded PDFs
    # --------------------------------------------------------

    for file in files:

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"{file.filename} is not a PDF."
            )

        destination = DATA_RAW_DIR / file.filename

        with open(destination, "wb") as output:

            shutil.copyfileobj(
                file.file,
                output
            )

        saved_paths.append(destination)

    # --------------------------------------------------------
    # 2. Extract chunks
    # --------------------------------------------------------

    all_chunks = []

    for path in saved_paths:

        chunks = chunk_pdf(str(path))

        all_chunks.extend(chunks)

    if not all_chunks:

        raise HTTPException(
            status_code=422,
            detail="No extractable text found in the PDF."
        )

    # --------------------------------------------------------
    # 3. Assign topics
    # --------------------------------------------------------

    texts = [
        chunk["text"]
        for chunk in all_chunks
    ]

    tagged_chunks = tag_chunks_batch(texts)

    for chunk, tagged in zip(
        all_chunks,
        tagged_chunks
    ):

        chunk["topic"] = topics_to_metadata_string(
            tagged["topics"]
        )

    # --------------------------------------------------------
    # 4. Store in ChromaDB
    # --------------------------------------------------------

    collection = get_collection()

    ids = [
        f"{chunk['source']}_p{chunk['page']}"
        for chunk in all_chunks
    ]

    documents = [
        chunk["text"]
        for chunk in all_chunks
    ]

    metadatas = [
        {
            "source": chunk["source"],
            "page": chunk["page"],
            "topic": chunk["topic"]
        }
        for chunk in all_chunks
    ]

    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    # --------------------------------------------------------
    # 5. Return result
    # --------------------------------------------------------

    topics_found = sorted(
        {
            topic
            for chunk in all_chunks
            for topic in chunk["topic"].split(",")
        }
    )

    return {
        "files_processed": [
            path.name
            for path in saved_paths
        ],
        "chunks_stored": len(all_chunks),
        "topics_found": topics_found
    }


# ============================================================
# RAG QUESTION ANSWERING
# ============================================================

@app.post("/ask")
def ask_question(req: AskRequest):

    if not req.question.strip():

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    answer = generate_answer(
        req.question,
        n_results=req.n_results
    )

    return {
        "question": req.question,
        "answer": answer
    }


# ============================================================
# QUIZ GENERATION
# ============================================================

@app.post("/quiz/generate")
def create_quiz(
    req: QuizGenerateRequest
):

    try:

        quiz = generate_quiz(
            req.topic,
            num_questions=req.num_questions
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    if not quiz:

        raise HTTPException(
            status_code=422,
            detail="No valid quiz questions were generated."
        )

    return {
        "topic": req.topic,
        "questions": quiz
    }


# ============================================================
# QUIZ SUBMISSION
# ============================================================

@app.post("/quiz/submit")
def submit_quiz(
    req: QuizSubmitRequest
):

    if not req.results:

        raise HTTPException(
            status_code=400,
            detail="No quiz results submitted."
        )

    results = [
        {
            "question": result.question,
            "is_correct": result.is_correct
        }
        for result in req.results
    ]

    record_quiz_session(
        req.topic,
        results
    )

    correct = sum(
        1
        for result in req.results
        if result.is_correct
    )

    score = correct / len(req.results)

    return {
        "topic": req.topic,
        "submitted": len(req.results),
        "correct": correct,
        "score": round(score, 3)
    }


# ============================================================
# MASTERY
# ============================================================

@app.get("/mastery")
def mastery_overview():

    return {
        "mastery": get_all_mastery()
    }


@app.get("/mastery/weak-topics")
def weak_topics(
    threshold: float = Query(
        0.6,
        ge=0.0,
        le=1.0
    ),
    min_attempts: int = Query(
        2,
        ge=1
    )
):

    return {
        "weak_topics": get_weak_topics(
            threshold=threshold,
            min_attempts=min_attempts
        )
    }