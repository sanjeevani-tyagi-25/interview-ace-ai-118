from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.interview import Interview
from app.models.questions import Question
from app.models.answer import Answer
from app.models.report import Report, QuestionReport

from app.schemas.report import ReportResponse
from app.services.report_service import generate_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
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
# HELPER - SAFE SCORE
# ============================================================

def safe_score(value, default=0):
    """
    Convert a score safely to an integer between 0 and 100.
    """

    try:
        score = int(float(value))
    except (ValueError, TypeError):
        score = default

    return max(0, min(100, score))


# ============================================================
# GENERATE REPORT
# ============================================================

@router.post(
    "/generate/{interview_id}",
    response_model=ReportResponse,
)
def generate_interview_report(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ========================================================
    # 1. FIND INTERVIEW
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
            detail="No questions found for this interview",
        )

    # ========================================================
    # 3. BUILD Q&A FOR AI
    # ========================================================

    qa_text = ""
    answer_scores = []
    question_data = []

    for question in questions:

        answer = (
            db.query(Answer)
            .filter(
                Answer.question_id == question.id
            )
            .first()
        )

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print("\n========================================")
        print(f"QUESTION ID: {question.id}")
        print(f"QUESTION: {question.question_text}")
        print(
            f"ANSWER FOUND: {answer is not None}"
        )

        if answer:
            print(
                f"ANSWER: {answer.answer_text}"
            )
            print(
                f"SCORE: {answer.score}"
            )
            print(
                f"FEEDBACK: {answer.feedback}"
            )
        else:
            print("ANSWER: NO ANSWER")

        # ----------------------------------------------------
        # GET ANSWER SCORE
        # ----------------------------------------------------

        raw_score = 0

        if answer and answer.score is not None:

            try:
                raw_score = int(
                    float(answer.score)
                )

                # Answer scores are 0-10
                raw_score = max(
                    0,
                    min(10, raw_score)
                )

                answer_scores.append(
                    raw_score
                )

            except (
                ValueError,
                TypeError,
            ):
                print(
                    f"⚠️ Invalid score for "
                    f"question {question.id}: "
                    f"{answer.score}"
                )

        # ----------------------------------------------------
        # CONVERT 0-10 TO 0-100
        # ----------------------------------------------------

        question_score = raw_score * 10

        # ----------------------------------------------------
        # SAVE QUESTION DATA
        # ----------------------------------------------------

        question_data.append(
            {
                "question_number": question.question_order,
                "question": question.question_text,
                "score": question_score,
                "answer_feedback": (
                    answer.feedback
                    if answer and answer.feedback
                    else None
                ),
            }
        )

        # ----------------------------------------------------
        # BUILD AI INPUT
        # ----------------------------------------------------

        answer_text = (
            answer.answer_text
            if answer and answer.answer_text
            else "No Answer"
        )

        answer_score = (
            answer.score
            if answer and answer.score is not None
            else 0
        )

        answer_feedback = (
            answer.feedback
            if answer and answer.feedback
            else "No Feedback"
        )

        qa_text += f"""
Question:
{question.question_text}

Answer:
{answer_text}

Score:
{answer_score}

Feedback:
{answer_feedback}

----------------------------------------
"""

    # ========================================================
    # DEBUG SUMMARY
    # ========================================================

    print("\n========================================")
    print("INTERVIEW Q&A")
    print("========================================")
    print(qa_text)
    print("========================================")
    print(
        f"📊 ANSWER SCORES: {answer_scores}"
    )
    print(
        f"📊 TOTAL QUESTIONS: {len(questions)}"
    )
    print("========================================")

    # ========================================================
    # 4. GENERATE AI REPORT
    # ========================================================

    try:

        report_data = generate_report(
            qa_text,
            answer_scores,
        )

    except Exception as error:

        print(
            "❌ Report generation error:"
        )
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate interview report",
        )

    # ========================================================
    # 5. VALIDATE AI REPORT
    # ========================================================

    if not isinstance(report_data, dict):

        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid report format",
        )

    required_fields = [
        "overall_score",
        "strengths",
        "weaknesses",
        "suggestions",
        "final_feedback",
    ]

    for field in required_fields:

        if field not in report_data:

            raise HTTPException(
                status_code=500,
                detail=f"Report is missing field: {field}",
            )

    # ========================================================
    # 6. SAFE CATEGORY SCORES
    # ========================================================

    overall_score = safe_score(
        report_data.get(
            "overall_score",
            0,
        )
    )

    technical_score = safe_score(
        report_data.get(
            "technical_score",
            0,
        )
    )

    answer_quality_score = safe_score(
        report_data.get(
            "answer_quality_score",
            0,
        )
    )

    problem_solving_score = safe_score(
        report_data.get(
            "problem_solving_score",
            0,
        )
    )

    communication_score = safe_score(
        report_data.get(
            "communication_score",
            0,
        )
    )

    # ========================================================
    # 7. DELETE OLD REPORT
    # ========================================================

    old_report = (
        db.query(Report)
        .filter(
            Report.interview_id == interview_id
        )
        .first()
    )

    if old_report:

        # Delete old question reports first
        db.query(QuestionReport).filter(
            QuestionReport.report_id == old_report.id
        ).delete(
            synchronize_session=False
        )

        db.delete(old_report)

        db.flush()

    # ========================================================
    # 8. CREATE NEW REPORT
    # ========================================================

    report = Report(
        interview_id=interview_id,
        overall_score=overall_score,
        technical_score=technical_score,
        answer_quality_score=answer_quality_score,
        problem_solving_score=problem_solving_score,
        communication_score=communication_score,
        strengths=report_data.get("strengths"),
        weaknesses=report_data.get("weaknesses"),
        suggestions=report_data.get("suggestions"),
        final_feedback=report_data.get("final_feedback"),
    )

    db.add(report)

    # Generate report ID
    db.flush()

    # ========================================================
    # 9. CREATE QUESTION-WISE REPORTS
    # ========================================================

    ai_question_reports = report_data.get(
        "question_reports",
        []
    )

    if not isinstance(
        ai_question_reports,
        list
    ):
        ai_question_reports = []

    for index, item in enumerate(question_data):

        ai_evaluation = None

        if index < len(ai_question_reports):

            candidate = ai_question_reports[index]

            if isinstance(
                candidate,
                dict
            ):
                ai_evaluation = candidate

        # ----------------------------------------------------
        # QUESTION SCORE
        # ----------------------------------------------------

        question_score = item["score"]

        if ai_evaluation:

            question_score = safe_score(
                ai_evaluation.get(
                    "score",
                    question_score,
                )
            )

        # ----------------------------------------------------
        # QUESTION REMARK
        # ----------------------------------------------------

        remark = None

        if ai_evaluation:

            remark = ai_evaluation.get(
                "remark"
            )

        # Fallback to answer feedback
        if not remark:

            remark = item[
                "answer_feedback"
            ]

        # Final fallback
        if not remark:

            if question_score >= 90:

                remark = (
                    "Excellent response. "
                    "The answer demonstrated "
                    "strong understanding and "
                    "clear communication."
                )

            elif question_score >= 80:

                remark = (
                    "Good response with relevant "
                    "points. A little more depth "
                    "could make the answer stronger."
                )

            elif question_score >= 70:

                remark = (
                    "Fair response. Consider "
                    "providing more specific "
                    "examples and explanations."
                )

            else:

                remark = (
                    "The response needs improvement. "
                    "Focus on clarity, relevance, "
                    "and providing stronger examples."
                )

        # ----------------------------------------------------
        # CREATE QUESTION REPORT
        # ----------------------------------------------------

        question_report = QuestionReport(
            report_id=report.id,
            question_number=item[
                "question_number"
            ],
            question=item[
                "question"
            ],
            score=question_score,
            remark=remark,
        )

        db.add(question_report)

    # ========================================================
    # 10. SAVE REPORT
    # ========================================================

    try:

        db.commit()

        db.refresh(report)

    except Exception as error:

        db.rollback()

        print(
            "❌ Failed to save report:"
        )
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Failed to save interview report",
        )

    # ========================================================
    # 11. LOAD QUESTION REPORTS
    # ========================================================

    report.question_reports

    # ========================================================
    # DEBUG
    # ========================================================

    print("\n========================================")
    print("✅ REPORT SAVED SUCCESSFULLY")
    print(
        f"Report ID: {report.id}"
    )
    print(
        f"Interview ID: {report.interview_id}"
    )
    print(
        f"Overall Score: {report.overall_score}/100"
    )
    print(
        f"Technical: {report.technical_score}/100"
    )
    print(
        f"Answer Quality: {report.answer_quality_score}/100"
    )
    print(
        f"Problem Solving: {report.problem_solving_score}/100"
    )
    print(
        f"Communication: {report.communication_score}/100"
    )
    print(
        f"Question Reports: "
        f"{len(report.question_reports)}"
    )
    print("========================================\n")

    return report


# ============================================================
# GET EXISTING REPORT
# ============================================================

@router.get(
    "/{interview_id}",
    response_model=ReportResponse,
)
def get_interview_report(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ========================================================
    # 1. CHECK INTERVIEW OWNERSHIP
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
    # 2. FIND REPORT
    # ========================================================

    report = (
        db.query(Report)
        .filter(
            Report.interview_id == interview_id
        )
        .first()
    )

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    # ========================================================
    # 3. LOAD QUESTION REPORTS
    # ========================================================

    report.question_reports

    print(
        f"📄 Report loaded: "
        f"Interview {interview_id}, "
        f"Report {report.id}"
    )

    return report