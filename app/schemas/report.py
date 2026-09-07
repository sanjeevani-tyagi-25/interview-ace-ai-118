from pydantic import BaseModel
from typing import List


# ============================================================
# QUESTION-WISE REPORT RESPONSE
# ============================================================

class QuestionReportResponse(BaseModel):

    id: int

    question_number: int

    question: str

    score: int

    remark: str | None = None

    class Config:
        from_attributes = True


# ============================================================
# COMPLETE REPORT RESPONSE
# ============================================================

class ReportResponse(BaseModel):

    # ========================================================
    # BASIC INFORMATION
    # ========================================================

    id: int

    interview_id: int

    # ========================================================
    # OVERALL SCORE
    # ========================================================

    overall_score: int

    # ========================================================
    # CATEGORY SCORES
    # ========================================================

    technical_score: int

    answer_quality_score: int

    problem_solving_score: int

    communication_score: int

    # ========================================================
    # GENERAL FEEDBACK
    # ========================================================

    strengths: str | None = None

    weaknesses: str | None = None

    suggestions: str | None = None

    final_feedback: str | None = None

    # ========================================================
    # QUESTION-WISE PERFORMANCE
    # ========================================================

    question_reports: List[
        QuestionReportResponse
    ] = []

    # ========================================================
    # PYDANTIC / SQLALCHEMY CONFIG
    # ========================================================

    class Config:
        from_attributes = True