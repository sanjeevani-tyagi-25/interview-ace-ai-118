from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.core.dependencies import get_current_user

from app.models.questions import Question
from app.models.interview import Interview
from app.models.user import User


router = APIRouter(
    prefix="/questions",
    tags=["Questions"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{interview_id}")
def get_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # Check that the interview belongs to the logged-in user
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    # Get questions for this interview
    questions = (
        db.query(Question)
        .filter(
            Question.interview_id == interview_id
        )
        .order_by(Question.question_order)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found for this interview",
        )

    return questions