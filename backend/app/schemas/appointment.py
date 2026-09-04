from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ============================================================
# APPOINTMENT CREATE
# ============================================================

class AppointmentCreate(BaseModel):
    hospital_id: int
    doctor_id: Optional[int] = None
    consultation_id: Optional[int] = None

    department: str

    appointment_date: date
    appointment_time: time

    queue_number: Optional[int] = None

    priority: str = "Low"

    status: str = "booked"

    notes: Optional[str] = None


# ============================================================
# APPOINTMENT RESPONSE
# ============================================================

class AppointmentResponse(BaseModel):
    id: int

    patient_id: int
    hospital_id: int
    doctor_id: Optional[int] = None
    consultation_id: Optional[int] = None

    department: str

    appointment_date: date
    appointment_time: time

    queue_number: Optional[int] = None

    priority: str
    status: str

    notes: Optional[str] = None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )