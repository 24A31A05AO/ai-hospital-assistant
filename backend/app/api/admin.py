from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.user import User
from app.models.consultation import Consultation

from app.crud.consultation import (
    consultation_to_response_data,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================
# REQUEST SCHEMAS
# ============================================================


class AdminUserUpdateRequest(BaseModel):
    role: str | None = None
    is_active: bool | None = None


class AssignDoctorRequest(BaseModel):
    doctor_id: int


# ============================================================
# HELPERS
# ============================================================


def require_admin(current_user: User):
    """
    Allow only admin users.
    """

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


def user_to_response(user: User):
    """
    Convert User database object into
    frontend-friendly response.
    """

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "village": getattr(
            user,
            "village",
            None,
        ),
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


# ============================================================
# ADMIN STATISTICS
# ============================================================


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    total_users = (
        db.query(User).count()
    )

    total_patients = (
        db.query(User)
        .filter(
            User.role == "patient"
        )
        .count()
    )

    total_doctors = (
        db.query(User)
        .filter(
            User.role == "doctor"
        )
        .count()
    )

    total_admins = (
        db.query(User)
        .filter(
            User.role == "admin"
        )
        .count()
    )

    total_consultations = (
        db.query(Consultation).count()
    )

    pending_consultations = (
        db.query(Consultation)
        .filter(
            Consultation.status.in_(
                [
                    "Pending",
                    "pending",
                ]
            )
        )
        .count()
    )

    reviewed_consultations = (
        db.query(Consultation)
        .filter(
            Consultation.status.in_(
                [
                    "reviewed",
                    "Reviewed",
                ]
            )
        )
        .count()
    )

    emergency_consultations = (
        db.query(Consultation)
        .filter(
            Consultation.priority.in_(
                [
                    "Emergency",
                    "emergency",
                ]
            )
        )
        .count()
    )

    assigned_consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id.isnot(None)
        )
        .count()
    )

    unassigned_consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id.is_(None)
        )
        .count()
    )

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_admins": total_admins,
        "total_consultations": total_consultations,
        "pending_consultations": pending_consultations,
        "reviewed_consultations": reviewed_consultations,
        "emergency_consultations": emergency_consultations,
        "assigned_consultations": assigned_consultations,
        "unassigned_consultations": unassigned_consultations,
    }


# ============================================================
# GET ALL USERS
# ============================================================


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    users = (
        db.query(User)
        .order_by(User.id)
        .all()
    )

    return [
        user_to_response(user)
        for user in users
    ]


# ============================================================
# GET ALL DOCTORS
# ============================================================


@router.get("/doctors")
def get_all_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return only active doctors.

    This endpoint is used by the Admin Dashboard
    doctor dropdown.
    """

    require_admin(current_user)

    doctors = (
        db.query(User)
        .filter(
            User.role == "doctor",
            User.is_active.is_(True),
        )
        .order_by(
            User.full_name.asc()
        )
        .all()
    )

    return [
        user_to_response(doctor)
        for doctor in doctors
    ]


# ============================================================
# GET ONE USER
# ============================================================


@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user_to_response(user)


# ============================================================
# UPDATE USER
# ============================================================


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    update_data: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if (
        update_data.role is None
        and update_data.is_active is None
    ):
        raise HTTPException(
            status_code=400,
            detail="No update data supplied",
        )

    # ========================================================
    # ROLE UPDATE
    # ========================================================

    if update_data.role is not None:

        role = (
            update_data.role
            .strip()
            .lower()
        )

        allowed_roles = {
            "patient",
            "doctor",
            "admin",
        }

        if role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid role. "
                    "Allowed roles: "
                    "patient, doctor, admin."
                ),
            )

        # Prevent admin from removing
        # their own admin role.

        if (
            user.id == current_user.id
            and role != "admin"
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "You cannot remove "
                    "your own admin role."
                ),
            )

        user.role = role

    # ========================================================
    # ACTIVE / INACTIVE
    # ========================================================

    if update_data.is_active is not None:

        if (
            user.id == current_user.id
            and update_data.is_active is False
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "You cannot deactivate "
                    "your own account."
                ),
            )

        user.is_active = (
            update_data.is_active
        )

    # ========================================================
    # SAVE
    # ========================================================

    try:
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update user.",
        )

    return user_to_response(user)


# ============================================================
# GET ALL CONSULTATIONS
# ============================================================


@router.get("/consultations")
def get_all_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    consultations = (
        db.query(Consultation)
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
# GET ONE CONSULTATION
# ============================================================


@router.get(
    "/consultations/{consultation_id}"
)
def get_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id
            == consultation_id
        )
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    return consultation_to_response_data(
        consultation,
        db,
    )


# ============================================================
# ASSIGN DOCTOR TO CONSULTATION
# ============================================================


@router.patch(
    "/consultations/{consultation_id}/assign"
)
def assign_doctor(
    consultation_id: int,
    assignment: AssignDoctorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Assign a doctor to a consultation.

    Only admins can perform this operation.
    """

    # --------------------------------------------------------
    # ADMIN CHECK
    # --------------------------------------------------------

    require_admin(current_user)

    # --------------------------------------------------------
    # FIND CONSULTATION
    # --------------------------------------------------------

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id
            == consultation_id
        )
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    # --------------------------------------------------------
    # FIND DOCTOR
    # --------------------------------------------------------

    doctor = (
        db.query(User)
        .filter(
            User.id
            == assignment.doctor_id
        )
        .first()
    )

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    # --------------------------------------------------------
    # VERIFY ROLE
    # --------------------------------------------------------

    if doctor.role != "doctor":
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected user is not a doctor."
            ),
        )

    # --------------------------------------------------------
    # VERIFY ACTIVE ACCOUNT
    # --------------------------------------------------------

    if not doctor.is_active:
        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot assign consultation "
                "to an inactive doctor."
            ),
        )

    # --------------------------------------------------------
    # ASSIGN DOCTOR
    # --------------------------------------------------------

    consultation.doctor_id = doctor.id

    # Once assigned, move consultation
    # from pending to in_progress.

    consultation.status = "in_progress"

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
                "Unable to assign doctor."
            ),
        )

    # --------------------------------------------------------
    # RETURN UPDATED CONSULTATION
    # --------------------------------------------------------

    return consultation_to_response_data(
        consultation,
        db,
    )


# ============================================================
# UNASSIGN DOCTOR
# ============================================================


@router.patch(
    "/consultations/{consultation_id}/unassign"
)
def unassign_doctor(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove the assigned doctor from a consultation.

    Only admins can perform this operation.
    """

    require_admin(current_user)

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id
            == consultation_id
        )
        .first()
    )

    if consultation is None:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    # Remove doctor assignment.

    consultation.doctor_id = None

    # Put consultation back into pending state.

    consultation.status = "pending"

    try:
        db.commit()
        db.refresh(consultation)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to unassign doctor."
            ),
        )

    return consultation_to_response_data(
        consultation,
        db,
    )