from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import get_db
from api import models, schemas, auth
from RAG.quiz_generator import generate_quiz

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate", response_model=schemas.QuizOut)
def create_quiz(
    req: schemas.QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        generated = generate_quiz(req.topic, num_questions=req.num_questions)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if not generated:
        raise HTTPException(status_code=422, detail="No valid questions could be generated")

    quiz = models.Quiz(
        owner_id=current_user.id,
        document_id=req.document_id,
        topic=req.topic,
    )
    db.add(quiz)
    db.flush()  # quiz.id chahiye Question rows ke liye, commit se pehle

    for q in generated:
        question = models.Question(
            quiz_id=quiz.id,
            question_text=q["question"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q.get("explanation"),
            source_citation=q.get("source"),
        )
        db.add(question)

    db.commit()
    db.refresh(quiz)
    return quiz


@router.post("/attempt", response_model=schemas.AttemptResult)
def submit_attempt(
    submission: schemas.AttemptSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    question = db.query(models.Question).filter(
        models.Question.id == submission.question_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = submission.selected_option == question.correct_answer

    attempt = models.QuizAttempt(
        user_id=current_user.id,
        question_id=question.id,
        topic=question.quiz.topic,
        is_correct=is_correct,
    )
    db.add(attempt)
    db.commit()

    return {
        "question_id": question.id,
        "is_correct": is_correct,
        "correct_answer": question.correct_answer,
        "explanation": question.explanation,
    }