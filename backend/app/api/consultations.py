from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.crud.consultation import (
    create_consultation,
    get_consultations_by_patient,
    get_consultation_by_id,
    consultation_to_response_data,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationResponse,
)

router = APIRouter(
    prefix="/consultations",
    tags=["Consultations"],
)


# ============================================================
# CREATE CONSULTATION
# ============================================================

@router.post(
    "/",
    response_model=ConsultationResponse,
)
def create(
    consultation: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_consultation(
        db,
        current_user.id,
        consultation,
    )


# ============================================================
# GET MY CONSULTATIONS
# ============================================================

@router.get(
    "/my",
    response_model=list[ConsultationResponse],
)
def my_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_consultations_by_patient(
        db,
        current_user.id,
    )


# ============================================================
# GET SINGLE CONSULTATION
# ============================================================

@router.get(
    "/{consultation_id}",
    response_model=ConsultationResponse,
)
def get_single_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single consultation.

    Authorization:
    - Patient -> only their own consultation
    - Doctor -> only consultations assigned to them
    - Admin -> any consultation
    """

    consultation = get_consultation_by_id(
        db,
        consultation_id,
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    # ========================================================
    # ADMIN
    # ========================================================

    if current_user.role == "admin":
        return consultation_to_response_data(
            consultation,
            db,
        )

    # ========================================================
    # PATIENT
    # ========================================================

    if current_user.role == "patient":

        if consultation.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized "
                    "to access this consultation"
                ),
            )

    # ========================================================
    # DOCTOR
    # ========================================================

    elif current_user.role == "doctor":

        if consultation.doctor_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized "
                    "to access this consultation"
                ),
            )

    # ========================================================
    # UNKNOWN ROLE
    # ========================================================

    else:
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have permission "
                "to access this consultation"
            ),
        )

    # ========================================================
    # RESPONSE
    # ========================================================

    return consultation_to_response_data(
        consultation,
        db,
    )