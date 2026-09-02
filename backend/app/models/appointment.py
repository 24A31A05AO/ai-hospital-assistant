from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.models.base import Base


class Appointment(Base):
    __tablename__ = "appointments"

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

    patient_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # HOSPITAL
    # ============================================================

    hospital_id = Column(
        Integer,
        ForeignKey("hospitals.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # DOCTOR
    # ============================================================

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    # ============================================================
    # CONSULTATION
    # ============================================================

    consultation_id = Column(
        Integer,
        ForeignKey("consultations.id"),
        nullable=True,
        index=True,
    )

    # ============================================================
    # APPOINTMENT INFORMATION
    # ============================================================

    department = Column(
        String(100),
        nullable=False,
    )

    appointment_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    appointment_time = Column(
        Time,
        nullable=False,
    )

    # ============================================================
    # QUEUE
    # ============================================================

    queue_number = Column(
        Integer,
        nullable=True,
        index=True,
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Low",
    )

    # ============================================================
    # STATUS
    # ============================================================

    status = Column(
        String(30),
        nullable=False,
        default="booked",
        index=True,
    )

    # ============================================================
    # OPTIONAL NOTES
    # ============================================================

    notes = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # DATE CREATED
    # ============================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    patient = relationship(
        "User",
        foreign_keys=[patient_id],
    )

    doctor = relationship(
        "User",
        foreign_keys=[doctor_id],
    )

    hospital = relationship(
        "Hospital",
        foreign_keys=[hospital_id],
    )

    consultation = relationship(
        "Consultation",
        foreign_keys=[consultation_id],
    )