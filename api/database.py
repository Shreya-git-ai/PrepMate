"""
Database connection setup.

DATABASE_URL .env se aayega:
  local dev  -> postgresql://user:pass@localhost:5432/prepmate
  production -> Render ka managed Postgres URL

get_db()---FastAPI dependency hai — returns new session per request and closes once done
database.py → DB setup + shared Base

"""

import os
from pathlib import Path

from dotenv import load_dotenv
# SQLAlchemy must be installed in the selected Python environment:
#   pip install sqlalchemy psycopg2-binary
from sqlalchemy import create_engine  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import sessionmaker, declarative_base  # pyright: ignore[reportMissingImports]

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL missing. add in .env, e.g.\n"
        "DATABASE_URL=postgresql://postgres:password@localhost:5432/prepmate"
    )

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """FastAPI dependency — Depends(get_db) routes mein use hoga."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()