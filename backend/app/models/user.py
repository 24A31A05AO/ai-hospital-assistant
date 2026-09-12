from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    phone = Column(String(15), nullable=False)

    village = Column(
        String(100),
        nullable=False,
        default="",
    )

    department = Column(
        String(100),
        nullable=True,
    )

    # ---------------------------------------------------------
    # HOSPITAL ASSIGNMENT
    #
    # Patients/admins can have NULL.
    # Doctors should have a hospital_id.
    # ---------------------------------------------------------

    hospital_id = Column(
        Integer,
        ForeignKey(
            "hospitals.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    role = Column(
        String(20),
        nullable=False,
        default="patient",
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # ---------------------------------------------------------
    # RELATIONSHIP
    # ---------------------------------------------------------

    hospital = relationship(
        "Hospital",
        foreign_keys=[hospital_id],
    )