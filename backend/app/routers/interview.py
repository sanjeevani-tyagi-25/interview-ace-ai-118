from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.core.dependencies import get_current_user

from app.models.interview import Interview
from app.models.questions import Question
from app.models.user import User
from app.models.report import Report

from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse,
)

from app.services.gemini_service import generate_questions


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# START INTERVIEW
# ============================================================

@router.post(
    "/start",
    response_model=InterviewResponse,
)
def start_interview(
    interview: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    new_interview = Interview(
        user_id=current_user.id,
        title=interview.title,
        company=interview.company,
        role=interview.role,
        domain=interview.domain,
        difficulty=interview.difficulty,
        interview_type=interview.interview_type,
        total_questions=interview.total_questions,
        score=0,
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    questions = generate_questions(
        company=interview.company,
        role=interview.role,
        domain=interview.domain,
        difficulty=interview.difficulty,
        interview_type=interview.interview_type,
        total_questions=interview.total_questions,
    )

    for index, q in enumerate(questions, start=1):

        question = Question(
            interview_id=new_interview.id,
            question_text=q,
            question_type=interview.interview_type,
            question_order=index,
            expected_answer=None,
        )

        db.add(question)

    db.commit()

    return new_interview


# ============================================================
# INTERVIEW HISTORY
# ============================================================

@router.get("/history")
def interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    interviews = (
        db.query(
            Interview,
            Report.overall_score,
        )
        .outerjoin(
            Report,
            Report.interview_id == Interview.id,
        )
        .filter(
            Interview.user_id == current_user.id,
        )
        .order_by(
            Interview.id.desc(),
        )
        .all()
    )

    history = []

    for interview, report_score in interviews:

        # ----------------------------------------------------
        # SCORE
        # ----------------------------------------------------

        if report_score is not None:
            score = report_score
        else:
            score = interview.score or 0

        # ----------------------------------------------------
        # HISTORY OBJECT
        # ----------------------------------------------------

        history.append(
            {
                "id": str(interview.id),

                "date": (
                    interview.created_at.strftime("%Y-%m-%d")
                    if interview.created_at
                    else ""
                ),

                "domain": interview.domain,

                "difficulty": interview.difficulty,

                "score": score,
            }
        )

    return history