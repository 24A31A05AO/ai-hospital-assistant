from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.user import User
from app.models.consultation import Consultation
from app.models.appointment import Appointment

from app.crud.consultation import (
    consultation_to_response_data,
)

from app.schemas.appointment import AppointmentResponse


router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"],
)


# ============================================================
# DOCTOR ACCESS CHECK
# ============================================================

def require_doctor(
    current_user: User,
):
    """
    Allow only active doctor accounts.
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
    """
    Return consultations assigned to the
    currently logged-in doctor.
    """

    require_doctor(current_user)

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id
            == current_user.id
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

@router.get(
    "/consultations/{consultation_id}"
)
def get_doctor_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get one consultation assigned to the
    currently logged-in doctor.
    """

    require_doctor(current_user)

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id
            == consultation_id,

            Consultation.doctor_id
            == current_user.id,
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

@router.patch(
    "/consultations/{consultation_id}"
)
def update_doctor_consultation(
    consultation_id: int,
    status: str | None = None,
    doctor_notes: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update doctor notes and/or consultation status.
    """

    require_doctor(current_user)

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id
            == consultation_id,

            Consultation.doctor_id
            == current_user.id,
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

    if (
        status is None
        and doctor_notes is None
    ):
        raise HTTPException(
            status_code=400,
            detail="No update data supplied",
        )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if status is not None:

        normalized_status = (
            status.strip().lower()
        )

        allowed_statuses = {
            "pending",
            "in_progress",
            "reviewed",
            "completed",
            "referred",
        }

        if (
            normalized_status
            not in allowed_statuses
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid consultation status. "
                    "Allowed values: pending, "
                    "in_progress, reviewed, "
                    "completed, referred."
                ),
            )

        consultation.status = (
            normalized_status
        )

    # --------------------------------------------------------
    # DOCTOR NOTES
    # --------------------------------------------------------

    if doctor_notes is not None:

        consultation.doctor_notes = (
            doctor_notes.strip()
        )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

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

@router.get(
    "/appointments",
    response_model=list[AppointmentResponse],
)
def get_doctor_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all appointments assigned to
    the currently logged-in doctor.
    """

    require_doctor(current_user)

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id
            == current_user.id
        )
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc(),
        )
        .all()
    )

    return appointments


# ============================================================
# GET ONE DOCTOR APPOINTMENT
# ============================================================

@router.get(
    "/appointments/{appointment_id}",
    response_model=AppointmentResponse,
)
def get_doctor_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get one appointment assigned to
    the currently logged-in doctor.
    """

    require_doctor(current_user)

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id
            == appointment_id,

            Appointment.doctor_id
            == current_user.id,
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

    return appointment