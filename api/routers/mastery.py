"""
Tracking/mastery_tracker.py ka raw-sqlite logic yahan ORM queries se
replace ho gaya hai — ab per-user tracking hoti hai (pehle global thi,
sabka data ek hi sqlite file mein mix tha).
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database import get_db
from api import models, schemas
from api import auth_core as auth

router = APIRouter(prefix="/mastery", tags=["mastery"])


def _topic_mastery(db: Session, user_id: int, topic: str) -> schemas.TopicMastery:
    total = db.query(func.count(models.QuizAttempt.id)).filter(
        models.QuizAttempt.user_id == user_id,
        models.QuizAttempt.topic == topic,
    ).scalar() or 0

    correct = db.query(func.count(models.QuizAttempt.id)).filter(
        models.QuizAttempt.user_id == user_id,
        models.QuizAttempt.topic == topic,
        models.QuizAttempt.is_correct.is_(True),
    ).scalar() or 0

    score = round(correct / total, 3) if total > 0 else 0.0

    return schemas.TopicMastery(
        topic=topic, total_attempts=total, correct=correct, mastery_score=score
    )


@router.get("/topic/{topic}", response_model=schemas.TopicMastery)
def get_topic_mastery(
    topic: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return _topic_mastery(db, current_user.id, topic)


@router.get("/all", response_model=list[schemas.TopicMastery])
def get_all_mastery(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    topics = db.query(models.QuizAttempt.topic).filter(
        models.QuizAttempt.user_id == current_user.id
    ).distinct().all()

    results = [_topic_mastery(db, current_user.id, t[0]) for t in topics]
    results.sort(key=lambda m: m.mastery_score)
    return results


@router.get("/weak", response_model=list[str])
def get_weak_topics(
    threshold: float = 0.6,
    min_attempts: int = 2,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    all_mastery = get_all_mastery(db=db, current_user=current_user)
    return [
        m.topic for m in all_mastery
        if m.mastery_score < threshold and m.total_attempts >= min_attempts
    ]
