from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.user import User
from app.models.appointment import Appointment

from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
)


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
)


# ============================================================
# CREATE APPOINTMENT
# PATIENT ONLY
# ============================================================

@router.post(
    "/",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=403,
            detail="Only patients can create appointments",
        )

    appointment = Appointment(
        patient_id=current_user.id,
        hospital_id=appointment_data.hospital_id,
        doctor_id=appointment_data.doctor_id,
        consultation_id=appointment_data.consultation_id,
        department=appointment_data.department,
        appointment_date=appointment_data.appointment_date,
        appointment_time=appointment_data.appointment_time,
        priority=appointment_data.priority,
        status="booked",
        notes=appointment_data.notes,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


# ============================================================
# MY APPOINTMENTS
# PATIENT ONLY
# ============================================================

@router.get(
    "/my",
    response_model=list[AppointmentResponse],
)
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=403,
            detail="Patient access required",
        )

    return (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == current_user.id
        )
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc(),
        )
        .all()
    )