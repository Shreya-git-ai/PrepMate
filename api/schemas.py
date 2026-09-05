"""
Pydantic schemas — request validation + response shaping.

Naming convention:
  XCreate  -> client se aane wala input
  XOut     -> client ko wapas jaane wala response (DB model se banega)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- User / Auth ----------

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ---------- Document ----------

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    status: str
    uploaded_at: datetime


# ---------- Q&A ----------

class QuestionRequest(BaseModel):
    question: str
    n_results: int = 3


class AnswerResponse(BaseModel):
    question: str
    answer: str


# ---------- Quiz ----------

class QuizGenerateRequest(BaseModel):
    topic: str
    num_questions: int = 5
    document_id: Optional[int] = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_text: str
    options: list[str]
    # correct_answer jaanbujh ke yahan nahi hai — quiz lete waqt
    # client ko answer nahi dikhna chahiye, sirf submit ke baad

class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic: str
    created_at: datetime
    questions: list[QuestionOut]


# ---------- Quiz Attempt ----------

class AttemptSubmit(BaseModel):
    question_id: int
    selected_option: str


class AttemptResult(BaseModel):
    question_id: int
    is_correct: bool
    correct_answer: str
    explanation: Optional[str] = None


# ---------- Mastery ----------

class TopicMastery(BaseModel):
    topic: str
    total_attempts: int
    correct: int
    mastery_score: float