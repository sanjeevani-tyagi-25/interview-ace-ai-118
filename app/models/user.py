from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # FULL NAME
    # ============================================================

    full_name = Column(
        String,
        nullable=False,
    )

    # ============================================================
    # EMAIL
    # ============================================================

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    # ============================================================
    # PASSWORD
    # ============================================================

    password = Column(
        String,
        nullable=False,
    )

    # ============================================================
    # TARGET ROLE
    # ============================================================

    target_role = Column(
        String,
        nullable=True,
    )

    # ============================================================
    # EXPERIENCE
    # ============================================================

    experience = Column(
        String,
        nullable=True,
    )

    # ============================================================
    # PROFILE PHOTO
    # ============================================================

    profile_photo = Column(
        String,
        nullable=True,
    )

    # ============================================================
    # EMAIL NOTIFICATIONS
    # ============================================================

    email_notifications = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    # ============================================================
    # INTERVIEWS
    # ============================================================

    interviews = relationship(
        "Interview",
        back_populates="user",
        cascade="all, delete",
    )

    # ============================================================
    # RESUME ANALYSES
    # ============================================================

    resume_analyses = relationship(
        "ResumeAnalysis",
        back_populates="user",
        cascade="all, delete",
    )