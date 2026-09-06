import os
import shutil

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from api.database import get_db
from api import models, schemas
from api import auth_core as auth
from ingestion.embed_and_store import process_single_file

router = APIRouter(prefix="/documents", tags=["ingestion"])

UPLOAD_DIR = "data/raw"


@router.post("/upload", response_model=schemas.DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    dest_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    document = models.Document(
        owner_id=current_user.id,
        filename=file.filename,
        status="pending",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        chunk_count = process_single_file(dest_path)
        document.status = "processed"
    except Exception:
        document.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to process document")

    db.commit()
    db.refresh(document)
    return document
