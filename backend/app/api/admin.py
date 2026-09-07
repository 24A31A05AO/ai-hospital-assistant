from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.user import User
from app.models.consultation import Consultation
from app.models.hospital import Hospital

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

    # ========================================================
    # USER COUNTS
    # ========================================================

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

    # ========================================================
    # CONSULTATION COUNTS
    # ========================================================

    total_consultations = (
        db.query(Consultation).count()
    )

    # ========================================================
    # TODAY'S CONSULTATIONS
    # ========================================================

    today_consultations = (
        db.query(Consultation)
        .filter(
            func.date(
                Consultation.created_at
            )
            == func.current_date()
        )
        .count()
    )

    # ========================================================
    # STATUS COUNTS
    # ========================================================

    pending_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(
                Consultation.status
            ).in_(
                [
                    "pending",
                ]
            )
        )
        .count()
    )

    in_progress_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(
                Consultation.status
            ).in_(
                [
                    "in_progress",
                    "in progress",
                ]
            )
        )
        .count()
    )

    completed_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(
                Consultation.status
            ).in_(
                [
                    "completed",
                ]
            )
        )
        .count()
    )

    reviewed_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(
                Consultation.status
            ).in_(
                [
                    "reviewed",
                ]
            )
        )
        .count()
    )

    referred_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(
                Consultation.status
            ).in_(
                [
                    "referred",
                ]
            )
        )
        .count()
    )

    # ========================================================
    # TODAY STATUS COUNTS
    # ========================================================

    today_pending = (
        db.query(Consultation)
        .filter(
            func.date(
                Consultation.created_at
            )
            == func.current_date(),
            func.lower(
                Consultation.status
            )
            == "pending",
        )
        .count()
    )

    today_in_progress = (
        db.query(Consultation)
        .filter(
            func.date(
                Consultation.created_at
            )
            == func.current_date(),
            func.lower(
                Consultation.status
            ).in_(
                [
                    "in_progress",
                    "in progress",
                ]
            ),
        )
        .count()
    )

    today_completed = (
        db.query(Consultation)
        .filter(
            func.date(
                Consultation.created_at
            )
            == func.current_date(),
            func.lower(
                Consultation.status
            )
            == "completed",
        )
        .count()
    )

    # ========================================================
    # PRIORITY
    # ========================================================

    emergency_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(
                Consultation.priority
            )
            == "emergency"
        )
        .count()
    )

    # ========================================================
    # DOCTOR ASSIGNMENT
    # ========================================================

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

    # ========================================================
    # HOSPITALS
    # ========================================================

    total_hospitals = (
        db.query(Hospital).count()
    )

    active_hospitals = (
        db.query(Hospital)
        .filter(
            Hospital.is_active.is_(True)
        )
        .count()
    )

    inactive_hospitals = (
        db.query(Hospital)
        .filter(
            Hospital.is_active.is_(False)
        )
        .count()
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        # Users
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_admins": total_admins,

        # Consultations
        "total_consultations": total_consultations,
        "today_consultations": today_consultations,

        # Overall status
        "pending_consultations": pending_consultations,
        "in_progress_consultations": (
            in_progress_consultations
        ),
        "completed_consultations": (
            completed_consultations
        ),
        "reviewed_consultations": (
            reviewed_consultations
        ),
        "referred_consultations": (
            referred_consultations
        ),

        # Today's status
        "today_pending": today_pending,
        "today_in_progress": today_in_progress,
        "today_completed": today_completed,

        # Priority
        "emergency_consultations": (
            emergency_consultations
        ),

        # Assignment
        "assigned_consultations": (
            assigned_consultations
        ),
        "unassigned_consultations": (
            unassigned_consultations
        ),

        # Hospitals
        "total_hospitals": total_hospitals,
        "active_hospitals": active_hospitals,
        "inactive_hospitals": inactive_hospitals,
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
# GET ALL ACTIVE DOCTORS
# ============================================================


@router.get("/doctors")
def get_all_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
#
# IMPORTANT:
#
# If is_active=False:
#     USER IS PERMANENTLY DELETED.
#
# If is_active=True:
#     USER REMAINS ACTIVE.
#
# Role changes still work normally.
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
    # NEVER DELETE YOUR OWN ADMIN ACCOUNT
    # ========================================================

    if (
        user.id == current_user.id
        and update_data.is_active is False
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "You cannot deactivate "
                "or delete your own account."
            ),
        )

    # ========================================================
    # PERMANENT USER DELETION
    #
    # Frontend sends:
    #
    # {
    #     "is_active": false
    # }
    #
    # Instead of setting inactive,
    # permanently delete the user.
    # ========================================================

    if update_data.is_active is False:

        # ----------------------------------------------------
        # If the user is a doctor:
        #
        # Remove doctor assignment from consultations first.
        #
        # This prevents foreign-key problems if
        # consultations.doctor_id references users.id.
        # ----------------------------------------------------

        if user.role == "doctor":

            db.query(Consultation).filter(
                Consultation.doctor_id == user.id
            ).update(
                {
                    Consultation.doctor_id: None,
                    Consultation.status: "pending",
                },
                synchronize_session=False,
            )

        # ----------------------------------------------------
        # If the user is a patient:
        #
        # IMPORTANT:
        # We do NOT delete their consultations here.
        #
        # If consultation.user_id has a foreign-key
        # relationship without cascade, deletion could fail.
        #
        # Therefore, first try to remove dependent
        # consultation records safely.
        # ----------------------------------------------------

        if user.role == "patient":

            patient_consultations = (
                db.query(Consultation)
                .filter(
                    Consultation.user_id == user.id
                )
                .all()
            )

            for consultation in patient_consultations:
                db.delete(consultation)

        # ----------------------------------------------------
        # Delete user permanently
        # ----------------------------------------------------

        try:
            db.delete(user)
            db.commit()

        except Exception:
            db.rollback()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to permanently delete user. "
                    "The user may still be referenced "
                    "by another database record."
                ),
            )

        return {
            "success": True,
            "message": (
                "User permanently deleted."
            ),
            "user_id": user_id,
        }

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

        # ----------------------------------------------------
        # Cannot remove own admin role
        # ----------------------------------------------------

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
    # ACTIVE = TRUE
    #
    # There is no inactive state anymore when using the
    # deactivate action.
    #
    # is_active=True simply keeps/reactivates the account.
    # ========================================================

    if update_data.is_active is True:

        user.is_active = True

    # ========================================================
    # SAVE NORMAL UPDATE
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
# ASSIGN DOCTOR
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

    if doctor.role != "doctor":
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected user is not a doctor."
            ),
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot assign consultation "
                "to an inactive doctor."
            ),
        )

    consultation.doctor_id = doctor.id
    consultation.status = "in_progress"

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

    consultation.doctor_id = None
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