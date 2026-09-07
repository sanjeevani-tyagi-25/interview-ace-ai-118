from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False,
    )

    question_text = Column(
        Text,
        nullable=False,
    )

    question_type = Column(
        String,
        default="Technical",
    )

    expected_answer = Column(
        Text,
        nullable=True,
    )

    question_order = Column(
        Integer,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    # Interview relationship
    interview = relationship(
        "Interview",
        back_populates="questions",
    )

    # Answers relationship
    answers = relationship(
        "Answer",
        back_populates="question",
        cascade="all, delete",
    )