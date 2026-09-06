from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from datetime import date, time

from app.models.doctor_availability import DoctorAvailability

from app.models.user import User
from app.models.consultation import Consultation
from app.models.appointment import Appointment

from app.crud.consultation import (
    consultation_to_response_data,
)


router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"],
)


# ============================================================
# DOCTOR ACCESS CHECK
# ============================================================

def require_doctor(current_user: User):
    """
    Allow only active doctor users.
    """

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    if not current_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Doctor account is inactive",
        )

    return current_user


# ============================================================
# GET ASSIGNED CONSULTATIONS
# ============================================================

@router.get("/consultations")
def get_doctor_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_doctor(current_user)

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id == current_user.id
        )
        .order_by(
            Consultation.created_at.desc()
        )
        .all()
    )

    return [
        consultation_to_response_data(
            consultation,
            db,
        )
        for consultation in consultations
    ]


# ============================================================
# GET ONE ASSIGNED CONSULTATION
# ============================================================

@router.get("/consultations/{consultation_id}")
def get_doctor_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_doctor(current_user)

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id,
            Consultation.doctor_id == current_user.id,
        )
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Consultation not found "
                "or not assigned to you."
            ),
        )

    return consultation_to_response_data(
        consultation,
        db,
    )


# ============================================================
# UPDATE DOCTOR REVIEW
# ============================================================

@router.patch("/consultations/{consultation_id}")
def update_doctor_consultation(
    consultation_id: int,
    status: str | None = None,
    doctor_notes: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_doctor(current_user)

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id,
            Consultation.doctor_id == current_user.id,
        )
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Consultation not found "
                "or not assigned to you."
            ),
        )

    if status is None and doctor_notes is None:
        raise HTTPException(
            status_code=400,
            detail="No update data supplied",
        )

    if status is not None:

        normalized_status = status.strip().lower()

        allowed_statuses = {
            "pending",
            "in_progress",
            "reviewed",
            "completed",
            "referred",
        }

        if normalized_status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid consultation status. "
                    "Allowed values: pending, "
                    "in_progress, reviewed, "
                    "completed, referred."
                ),
            )

        consultation.status = normalized_status

    if doctor_notes is not None:
        consultation.doctor_notes = doctor_notes.strip()

    try:
        db.commit()
        db.refresh(consultation)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update consultation.",
        )

    return consultation_to_response_data(
        consultation,
        db,
    )


# ============================================================
# GET DOCTOR APPOINTMENTS
# ============================================================

@router.get("/appointments")
def get_doctor_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return appointments assigned to the
    currently logged-in doctor.
    """

    require_doctor(current_user)

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == current_user.id
        )
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc(),
        )
        .all()
    )

    result = []

    for appointment in appointments:

        patient = appointment.patient

        result.append(
            {
                "id": appointment.id,

                "patient_id": appointment.patient_id,
                "hospital_id": appointment.hospital_id,

                "doctor_id": appointment.doctor_id,
                "consultation_id": appointment.consultation_id,

                "department": appointment.department,

                "appointment_date": (
                    appointment.appointment_date.isoformat()
                    if appointment.appointment_date
                    else None
                ),

                "appointment_time": (
                    appointment.appointment_time.isoformat()
                    if appointment.appointment_time
                    else None
                ),

                "queue_number": appointment.queue_number,

                "priority": appointment.priority,

                "status": appointment.status,

                "notes": appointment.notes,

                "created_at": (
                    appointment.created_at.isoformat()
                    if appointment.created_at
                    else None
                ),

                "patient": (
                    {
                        "id": patient.id,
                        "full_name": patient.full_name,
                        "email": patient.email,
                        "phone": patient.phone,
                        "village": patient.village,
                    }
                    if patient
                    else None
                ),
            }
        )

    return result


# ============================================================
# GET ONE DOCTOR APPOINTMENT
# ============================================================

@router.get("/appointments/{appointment_id}")
def get_doctor_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return one appointment assigned to this doctor.
    """

    require_doctor(current_user)

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.doctor_id == current_user.id,
        )
        .first()
    )

    if appointment is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Appointment not found "
                "or not assigned to you."
            ),
        )

    patient = appointment.patient

    return {
        "id": appointment.id,

        "patient_id": appointment.patient_id,
        "hospital_id": appointment.hospital_id,

        "doctor_id": appointment.doctor_id,
        "consultation_id": appointment.consultation_id,

        "department": appointment.department,

        "appointment_date": (
            appointment.appointment_date.isoformat()
            if appointment.appointment_date
            else None
        ),

        "appointment_time": (
            appointment.appointment_time.isoformat()
            if appointment.appointment_time
            else None
        ),

        "queue_number": appointment.queue_number,

        "priority": appointment.priority,

        "status": appointment.status,

        "notes": appointment.notes,

        "created_at": (
            appointment.created_at.isoformat()
            if appointment.created_at
            else None
        ),

        "patient": (
            {
                "id": patient.id,
                "full_name": patient.full_name,
                "email": patient.email,
                "phone": patient.phone,
                "village": patient.village,
            }
            if patient
            else None
        ),
    }

# ============================================================
# GET MY AVAILABILITY / UNAVAILABLE SLOTS
# ============================================================

@router.get("/availability")
def get_my_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_doctor(current_user)

    records = (
        db.query(DoctorAvailability)
        .filter(
            DoctorAvailability.doctor_id == current_user.id
        )
        .order_by(
            DoctorAvailability.unavailable_date.asc(),
            DoctorAvailability.start_time.asc(),
        )
        .all()
    )

    return [
        {
            "id": record.id,
            "doctor_id": record.doctor_id,
            "unavailable_date": (
                record.unavailable_date.isoformat()
                if record.unavailable_date
                else None
            ),
            "start_time": (
                record.start_time.isoformat()
                if record.start_time
                else None
            ),
            "end_time": (
                record.end_time.isoformat()
                if record.end_time
                else None
            ),
            "is_unavailable": record.is_unavailable,
            "reason": record.reason,
            "created_at": (
                record.created_at.isoformat()
                if record.created_at
                else None
            ),
        }
        for record in records
    ]


# ============================================================
# CREATE UNAVAILABLE DATE / TIME
# ============================================================

@router.post("/availability")
def create_availability(
    unavailable_date: date,
    start_time: time | None = None,
    end_time: time | None = None,
    reason: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_doctor(current_user)

    # --------------------------------------------------------
    # TIME VALIDATION
    # --------------------------------------------------------

    if (start_time is None) != (end_time is None):
        raise HTTPException(
            status_code=400,
            detail=(
                "Both start_time and end_time "
                "must be provided for a time range."
            ),
        )

    if (
        start_time is not None
        and end_time is not None
        and start_time >= end_time
    ):
        raise HTTPException(
            status_code=400,
            detail="End time must be later than start time.",
        )

    # --------------------------------------------------------
    # CHECK OVERLAPPING UNAVAILABLE PERIOD
    # --------------------------------------------------------

    existing_records = (
        db.query(DoctorAvailability)
        .filter(
            DoctorAvailability.doctor_id == current_user.id,
            DoctorAvailability.unavailable_date
            == unavailable_date,
            DoctorAvailability.is_unavailable.is_(True),
        )
        .all()
    )

    for existing in existing_records:

        # Existing whole-day block
        if (
            existing.start_time is None
            and existing.end_time is None
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "You are already unavailable "
                    "for this date."
                ),
            )

        # New whole-day block conflicts with any period
        if (
            start_time is None
            and end_time is None
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "An unavailable time already exists "
                    "for this date."
                ),
            )

        # Time overlap
        if (
            existing.start_time is not None
            and existing.end_time is not None
            and start_time < existing.end_time
            and end_time > existing.start_time
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "This unavailable time overlaps "
                    "with an existing unavailable period."
                ),
            )

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    record = DoctorAvailability(
        doctor_id=current_user.id,
        unavailable_date=unavailable_date,
        start_time=start_time,
        end_time=end_time,
        is_unavailable=True,
        reason=reason.strip() if reason else None,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Doctor availability updated successfully.",
        "availability": {
            "id": record.id,
            "doctor_id": record.doctor_id,
            "unavailable_date": record.unavailable_date.isoformat(),
            "start_time": (
                record.start_time.isoformat()
                if record.start_time
                else None
            ),
            "end_time": (
                record.end_time.isoformat()
                if record.end_time
                else None
            ),
            "is_unavailable": record.is_unavailable,
            "reason": record.reason,
        },
    }


# ============================================================
# DELETE UNAVAILABLE DATE / TIME
# ============================================================

@router.delete("/availability/{availability_id}")
def delete_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_doctor(current_user)

    record = (
        db.query(DoctorAvailability)
        .filter(
            DoctorAvailability.id == availability_id,
            DoctorAvailability.doctor_id == current_user.id,
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Availability record not found.",
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Unavailable period removed successfully."
    }