from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.user import User
from app.models.hospital import Hospital
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
    # --------------------------------------------------------
    # PATIENT CHECK
    # --------------------------------------------------------

    if current_user.role != "patient":
        raise HTTPException(
            status_code=403,
            detail="Only patients can create appointments",
        )

    # --------------------------------------------------------
    # DOCTOR ID CHECK
    # --------------------------------------------------------

    if appointment_data.doctor_id is None:
        raise HTTPException(
            status_code=400,
            detail="A doctor must be selected",
        )

    # --------------------------------------------------------
    # CHECK HOSPITAL
    # --------------------------------------------------------

    hospital = (
        db.query(Hospital)
        .filter(
            Hospital.id == appointment_data.hospital_id,
            Hospital.is_active.is_(True),
        )
        .first()
    )

    if hospital is None:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found or inactive",
        )

    # --------------------------------------------------------
    # CHECK DOCTOR
    # --------------------------------------------------------

    doctor = (
        db.query(User)
        .filter(
            User.id == appointment_data.doctor_id,
        )
        .first()
    )

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    if doctor.role != "doctor":
        raise HTTPException(
            status_code=400,
            detail="Selected user is not a doctor",
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=400,
            detail="Doctor is currently unavailable",
        )

    # --------------------------------------------------------
    # DOCTOR-HOSPITAL VALIDATION
    # --------------------------------------------------------

    if doctor.hospital_id != appointment_data.hospital_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected doctor does not belong "
                "to the selected hospital"
            ),
        )

    # --------------------------------------------------------
    # CHECK DOCTOR DOUBLE BOOKING
    # --------------------------------------------------------

    existing_doctor_appointment = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == appointment_data.doctor_id,
            Appointment.appointment_date
            == appointment_data.appointment_date,
            Appointment.appointment_time
            == appointment_data.appointment_time,
            Appointment.status.in_(
                [
                    "booked",
                    "confirmed",
                    "in_progress",
                ]
            ),
        )
        .first()
    )

    if existing_doctor_appointment:
        raise HTTPException(
            status_code=409,
            detail=(
                "This doctor is not available at "
                "the selected date and time. "
                "Please choose another time slot."
            ),
        )

    # --------------------------------------------------------
    # CHECK PATIENT DOUBLE BOOKING
    # --------------------------------------------------------

    existing_patient_appointment = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == current_user.id,
            Appointment.appointment_date
            == appointment_data.appointment_date,
            Appointment.appointment_time
            == appointment_data.appointment_time,
            Appointment.status.in_(
                [
                    "booked",
                    "confirmed",
                    "in_progress",
                ]
            ),
        )
        .first()
    )

    if existing_patient_appointment:
        raise HTTPException(
            status_code=409,
            detail=(
                "You already have an appointment "
                "at this date and time."
            ),
        )

    # --------------------------------------------------------
    # CREATE APPOINTMENT
    # --------------------------------------------------------

    new_appointment = Appointment(
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

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment


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