from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


# ============================================================
# REPORT
# ============================================================

class Report(Base):
    __tablename__ = "reports"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # INTERVIEW REFERENCE
    # ========================================================

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    # ========================================================
    # OVERALL SCORE
    # ========================================================

    overall_score = Column(
        Integer,
        default=0,
    )

    # ========================================================
    # CATEGORY SCORES
    # ========================================================

    technical_score = Column(
        Integer,
        default=0,
    )

    answer_quality_score = Column(
        Integer,
        default=0,
    )

    problem_solving_score = Column(
        Integer,
        default=0,
    )

    communication_score = Column(
        Integer,
        default=0,
    )

    # ========================================================
    # TEXT FEEDBACK
    # ========================================================

    strengths = Column(
        Text,
        nullable=True,
    )

    weaknesses = Column(
        Text,
        nullable=True,
    )

    suggestions = Column(
        Text,
        nullable=True,
    )

    final_feedback = Column(
        Text,
        nullable=True,
    )

    # ========================================================
    # RELATIONSHIP WITH INTERVIEW
    # ========================================================

    interview = relationship(
        "Interview",
        back_populates="report",
    )

    # ========================================================
    # RELATIONSHIP WITH QUESTION REPORTS
    # ========================================================

    question_reports = relationship(
        "QuestionReport",
        back_populates="report",
        cascade="all, delete-orphan",
    )


# ============================================================
# QUESTION REPORT
# ============================================================

class QuestionReport(Base):
    __tablename__ = "question_reports"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # REPORT REFERENCE
    # ========================================================

    report_id = Column(
        Integer,
        ForeignKey("reports.id"),
        nullable=False,
        index=True,
    )

    # ========================================================
    # QUESTION INFORMATION
    # ========================================================

    question_number = Column(
        Integer,
        nullable=False,
    )

    question = Column(
        Text,
        nullable=False,
    )

    # ========================================================
    # SCORE
    # ========================================================

    score = Column(
        Integer,
        default=0,
    )

    # ========================================================
    # REMARK
    # ========================================================

    remark = Column(
        Text,
        nullable=True,
    )

    # ========================================================
    # RELATIONSHIP WITH REPORT
    # ========================================================

    report = relationship(
        "Report",
        back_populates="question_reports",
    )