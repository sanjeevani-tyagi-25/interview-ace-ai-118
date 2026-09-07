from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.core.dependencies import get_current_user

from app.models.answer import Answer
from app.models.questions import Question
from app.models.interview import Interview
from app.models.user import User

from app.schemas.answer import (
    AnswerCreate,
    AnswerResponse,
)

from app.services.evaluation_service import evaluate_answer


router = APIRouter(
    prefix="/answers",
    tags=["Answers"],
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
# SUBMIT ANSWER
# ============================================================

@router.post(
    "/submit",
    response_model=AnswerResponse,
)
def submit_answer(
    answer: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ========================================================
    # 1. FIND QUESTION
    # ========================================================

    question = (
        db.query(Question)
        .filter(
            Question.id == answer.question_id
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    # ========================================================
    # 2. VERIFY INTERVIEW OWNERSHIP
    # ========================================================

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == question.interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this question",
        )

    # ========================================================
    # 3. EVALUATE ANSWER
    # ========================================================

    try:

        result = evaluate_answer(
            question.question_text,
            answer.answer_text,
        )

    except Exception as error:

        print(
            "\n❌ Answer evaluation error:"
        )

        print(error)

        raise HTTPException(
            status_code=500,
            detail="Failed to evaluate answer",
        )

    # ========================================================
    # 4. SAFELY GET EVALUATION RESULT
    # ========================================================

    score = result.get(
        "score",
        0,
    )

    feedback = result.get(
        "feedback",
        "No feedback available.",
    )

    # Make sure score is valid.
    try:

        score = int(
            float(score)
        )

    except (
        ValueError,
        TypeError,
    ):

        score = 0

    # Answer scores are 0-10.
    score = max(
        0,
        min(10, score)
    )

    # Make sure feedback is a string.
    if not feedback:

        feedback = (
            "No feedback available."
        )

    # ========================================================
    # 5. CHECK EXISTING ANSWER
    # ========================================================

    existing_answer = (
        db.query(Answer)
        .filter(
            Answer.question_id == question.id
        )
        .first()
    )

    # ========================================================
    # 6. UPDATE EXISTING ANSWER
    # ========================================================

    if existing_answer:

        existing_answer.answer_text = (
            answer.answer_text
        )

        existing_answer.score = score

        existing_answer.feedback = feedback

        try:

            db.commit()

            db.refresh(
                existing_answer
            )

        except Exception as error:

            db.rollback()

            print(
                "\n❌ Failed to update answer:"
            )

            print(error)

            raise HTTPException(
                status_code=500,
                detail="Failed to save answer",
            )

        print(
            "\n========================================"
        )

        print(
            "✅ ANSWER UPDATED"
        )

        print(
            f"Answer ID: {existing_answer.id}"
        )

        print(
            f"Question ID: {question.id}"
        )

        print(
            f"Interview ID: {interview.id}"
        )

        print(
            f"Score: {score}/10"
        )

        print(
            "========================================\n"
        )

        return existing_answer

    # ========================================================
    # 7. CREATE NEW ANSWER
    # ========================================================

    new_answer = Answer(
        question_id=question.id,
        answer_text=answer.answer_text,
        score=score,
        feedback=feedback,
    )

    db.add(
        new_answer
    )

    # ========================================================
    # 8. SAVE NEW ANSWER
    # ========================================================

    try:

        db.commit()

        db.refresh(
            new_answer
        )

    except Exception as error:

        db.rollback()

        print(
            "\n❌ Failed to save answer:"
        )

        print(error)

        raise HTTPException(
            status_code=500,
            detail="Failed to save answer",
        )

    # ========================================================
    # 9. DEBUG INFORMATION
    # ========================================================

    print(
        "\n========================================"
    )

    print(
        "✅ ANSWER SAVED SUCCESSFULLY"
    )

    print(
        f"Answer ID: {new_answer.id}"
    )

    print(
        f"Question ID: {question.id}"
    )

    print(
        f"Interview ID: {interview.id}"
    )

    print(
        f"Question Number: {question.question_order}"
    )

    print(
        f"Score: {new_answer.score}/10"
    )

    print(
        "========================================\n"
    )

    return new_answer


# ============================================================
# DEBUG - CHECK SAVED ANSWERS
# ============================================================

@router.get(
    "/debug/{interview_id}"
)
def debug_answers(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ========================================================
    # 1. VERIFY INTERVIEW OWNERSHIP
    # ========================================================

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

    # ========================================================
    # 2. GET QUESTIONS
    # ========================================================

    questions = (
        db.query(Question)
        .filter(
            Question.interview_id == interview_id
        )
        .order_by(
            Question.question_order
        )
        .all()
    )

    if not questions:

        raise HTTPException(
            status_code=404,
            detail="No questions found",
        )

    # ========================================================
    # 3. CHECK ANSWERS
    # ========================================================

    result = []

    for question in questions:

        answer = (
            db.query(Answer)
            .filter(
                Answer.question_id == question.id
            )
            .first()
        )

        result.append(
            {
                "question_id": question.id,

                "question_order": (
                    question.question_order
                ),

                "question": (
                    question.question_text
                ),

                "answer_found": (
                    answer is not None
                ),

                "answer_id": (
                    answer.id
                    if answer
                    else None
                ),

                "score": (
                    answer.score
                    if answer
                    else None
                ),

                "answer_text": (
                    answer.answer_text
                    if answer
                    else None
                ),

                "feedback": (
                    answer.feedback
                    if answer
                    else None
                ),
            }
        )

    # ========================================================
    # 4. RETURN DEBUG INFORMATION
    # ========================================================

    return {
        "interview_id": interview_id,

        "total_questions": len(
            questions
        ),

        "answered_questions": sum(
            1
            for item in result
            if item["answer_found"]
        ),

        "questions": result,
    }