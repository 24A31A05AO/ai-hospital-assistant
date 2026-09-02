from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.models.base import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # HOSPITAL INFORMATION
    # ============================================================

    name = Column(
        String(200),
        nullable=False,
    )

    address = Column(
        Text,
        nullable=True,
    )

    phone = Column(
        String(20),
        nullable=True,
    )

    email = Column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # QR CODE
    # ============================================================

    # Example:
    # Hospital ID 101
    # QR URL:
    # https://your-platform.com/start?hospital=101

    qr_code_id = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    # ============================================================
    # STATUS
    # ============================================================

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    # ============================================================
    # DATE
    # ============================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )