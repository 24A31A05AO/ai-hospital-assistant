from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.models.base import Base


class Consultation(Base):
    __tablename__ = "consultations"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # PATIENT
    # ============================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # ASSIGNED DOCTOR
    # ============================================================

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    # ============================================================
    # CONSULTATION INFORMATION
    # ============================================================

    chief_complaint = Column(
        String(255),
        nullable=False,
    )

    symptoms = Column(
        Text,
        nullable=True,
    )

    medical_history = Column(
        Text,
        nullable=True,
    )

    medications = Column(
        Text,
        nullable=True,
    )

    allergies = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # AI ANALYSIS
    # ============================================================

    ai_summary = Column(
        Text,
        nullable=True,
    )

    possible_conditions = Column(
        Text,
        nullable=True,
    )

    recommended_tests = Column(
        Text,
        nullable=True,
    )

    red_flags = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # HOSPITAL CLASSIFICATION
    # ============================================================

    department = Column(
        String(100),
        nullable=True,
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Low",
    )

    status = Column(
        String(20),
        nullable=False,
        default="Pending",
    )

    # ============================================================
    # DOCTOR REVIEW
    # ============================================================

    doctor_notes = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # DATE
    # ============================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    patient = relationship(
        "User",
        foreign_keys=[user_id],
    )

    doctor = relationship(
        "User",
        foreign_keys=[doctor_id],
    )