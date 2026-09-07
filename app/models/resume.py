from datetime import datetime

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database.database import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # USER REFERENCE
    # ============================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # ATS SCORE
    # ============================================================

    ats_score = Column(
        Integer,
        nullable=False,
    )

    # ============================================================
    # AI ANALYSIS DATA
    # ============================================================

    skills_found = Column(
        Text,
        nullable=True,
    )

    missing_skills = Column(
        Text,
        nullable=True,
    )

    suggestions = Column(
        Text,
        nullable=True,
    )

    strengths = Column(
        Text,
        nullable=True,
    )

    weaknesses = Column(
        Text,
        nullable=True,
    )

    summary = Column(
        Text,
        nullable=True,
    )

    experience_feedback = Column(
        Text,
        nullable=True,
    )

    projects_feedback = Column(
        Text,
        nullable=True,
    )

    keyword_feedback = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # RESUME INFORMATION
    # ============================================================

    filename = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # CREATED TIME
    # ============================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # ============================================================
    # RELATIONSHIP
    # ============================================================

    user = relationship(
        "User",
        back_populates="resume_analyses",
    )