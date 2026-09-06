from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
)
from sqlalchemy.sql import func

from app.models.base import Base


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    unavailable_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    start_time = Column(
        Time,
        nullable=True,
    )

    end_time = Column(
        Time,
        nullable=True,
    )

    is_unavailable = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    reason = Column(
        String(255),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )