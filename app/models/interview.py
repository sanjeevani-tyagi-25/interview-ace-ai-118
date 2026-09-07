from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Interview(Base):
    __tablename__ = "interviews"

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
    )

    # ============================================================
    # INTERVIEW INFORMATION
    # ============================================================

    title = Column(
        String,
        nullable=False,
    )

    company = Column(
        String,
        nullable=True,
    )

    role = Column(
        String,
        nullable=False,
    )

    domain = Column(
        String,
        nullable=False,
    )

    difficulty = Column(
        String,
        nullable=False,
    )

    interview_type = Column(
        String,
        nullable=False,
    )

    total_questions = Column(
        Integer,
        default=10,
    )

    score = Column(
        Integer,
        default=0,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    # ============================================================
    # RELATIONSHIP WITH USER
    # ============================================================

    user = relationship(
        "User",
        back_populates="interviews",
    )

    # ============================================================
    # RELATIONSHIP WITH QUESTIONS
    # ============================================================

    questions = relationship(
        "Question",
        back_populates="interview",
        cascade="all, delete",
    )

    # ============================================================
    # RELATIONSHIP WITH REPORT
    # ============================================================

    report = relationship(
        "Report",
        back_populates="interview",
        uselist=False,
        cascade="all, delete",
    )