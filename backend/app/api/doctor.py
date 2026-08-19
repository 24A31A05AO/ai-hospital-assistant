from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.user import User
from app.models.consultation import Consultation

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
    Allow only users with the doctor role.
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
    Return ONLY consultations assigned to
    the currently logged-in doctor.
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
    Get one consultation.

    A doctor can access it ONLY if it is
    assigned to that doctor.
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

    A doctor can update ONLY consultations
    assigned to that doctor.
    """

    require_doctor(current_user)

    # --------------------------------------------------------
    # FIND ONLY THIS DOCTOR'S CONSULTATION
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # CHECK UPDATE DATA
    # --------------------------------------------------------

    if (
        status is None
        and doctor_notes is None
    ):
        raise HTTPException(
            status_code=400,
            detail="No update data supplied",
        )

    # --------------------------------------------------------
    # UPDATE STATUS
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
    # UPDATE DOCTOR NOTES
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
            detail=(
                "Unable to update consultation."
            ),
        )

    # --------------------------------------------------------
    # RETURN UPDATED CONSULTATION
    # --------------------------------------------------------

    return consultation_to_response_data(
        consultation,
        db,
    )