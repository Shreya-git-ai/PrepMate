from fastapi import APIRouter, Depends

from api import models, schemas, auth
from RAG.generator import generate_answer

router = APIRouter(prefix="/qna", tags=["qna"])


@router.post("/ask", response_model=schemas.AnswerResponse)
def ask_question(
    req: schemas.QuestionRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    answer = generate_answer(req.question, n_results=req.n_results)
    return {"question": req.question, "answer": answer}