"""
SQLAlchemy models.

Mapping to existing pipeline:
- Document  -> ek uploaded PDF (ingestion/embed_and_store.py isko process
               karke ChromaDB mein daalta hai; filename yahan se hi source
               ki tarah pass hoga)
- Quiz      -> ek "generate quiz for topic X" session (RAG/quiz_generator.py)
- Question  -> Quiz ke andar ek individual MCQ (abhi tak yeh kahi save
               nahi hota tha, sirf generate ho ke response mein chala jata
               tha — ab persist hoga)
- QuizAttempt -> user ne ek question attempt kiya (Tracking/mastery_tracker.py
               ka sqlite table isi se replace hoga)
"""

from datetime import datetime, timezone

from sqlalchemy import (  # pyright: ignore[reportMissingImports]
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship  # pyright: ignore[reportMissingImports]

from api.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    documents = relationship(
        "Document", back_populates="owner", cascade="all, delete-orphan"
    )
    quizzes = relationship(
        "Quiz", back_populates="owner", cascade="all, delete-orphan"
    )
    attempts = relationship(
        "QuizAttempt", back_populates="user", cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # chunker.py isi filename ko "source" ki tarah ChromaDB metadata mein
    # daalta hai -> yeh column hi Chroma se relational DB ko link karta hai
    filename = Column(String, nullable=False)

    status = Column(String, default="pending")  # pending | processed | failed
    uploaded_at = Column(DateTime, default=utcnow)

    owner = relationship("User", back_populates="documents")
    quizzes = relationship("Quiz", back_populates="document")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)

    topic = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    owner = relationship("User", back_populates="quizzes")
    document = relationship("Document", back_populates="quizzes")
    questions = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)

    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)       # list[str], 4 options
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    source_citation = Column(String, nullable=True)  # quiz_generator.py ka "source"

    quiz = relationship("Quiz", back_populates="questions")
    attempts = relationship(
        "QuizAttempt", back_populates="question", cascade="all, delete-orphan"
    )


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    # denormalized rakha hai — mastery_tracker.py ki get_topic_mastery()
    # jaisi queries topic pe group-by karti hain, JOIN se bachne ke liye
    topic = Column(String, nullable=False, index=True)

    is_correct = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")