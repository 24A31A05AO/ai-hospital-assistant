from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.models.user import User
from app.models.consultation import Consultation
from app.models.hospital import Hospital

from app.core.security import (
    get_current_user,
    hash_password,
)

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
    hospital_id: int | None = None
    department: str | None = None


class AssignDoctorRequest(BaseModel):
    doctor_id: int


class AdminDoctorCreateRequest(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    phone: str = Field(
        ...,
        min_length=10,
        max_length=15,
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=72,
    )

    department: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    hospital_id: int


class AdminDoctorUpdateRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    department: str | None = None
    hospital_id: int | None = None
    is_active: bool | None = None


# ============================================================
# HELPERS
# ============================================================


def require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


def user_to_response(user: User):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "village": getattr(user, "village", None),
        "department": getattr(user, "department", None),
        "hospital_id": getattr(user, "hospital_id", None),
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

    total_users = db.query(User).count()

    total_patients = (
        db.query(User)
        .filter(User.role == "patient")
        .count()
    )

    total_doctors = (
        db.query(User)
        .filter(User.role == "doctor")
        .count()
    )

    total_admins = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    total_consultations = (
        db.query(Consultation).count()
    )

    today_consultations = (
        db.query(Consultation)
        .filter(
            func.date(Consultation.created_at)
            == func.current_date()
        )
        .count()
    )

    pending_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(Consultation.status)
            == "pending"
        )
        .count()
    )

    in_progress_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(Consultation.status).in_(
                ["in_progress", "in progress"]
            )
        )
        .count()
    )

    completed_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(Consultation.status)
            == "completed"
        )
        .count()
    )

    reviewed_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(Consultation.status)
            == "reviewed"
        )
        .count()
    )

    referred_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(Consultation.status)
            == "referred"
        )
        .count()
    )

    today_pending = (
        db.query(Consultation)
        .filter(
            func.date(Consultation.created_at)
            == func.current_date(),
            func.lower(Consultation.status)
            == "pending",
        )
        .count()
    )

    today_in_progress = (
        db.query(Consultation)
        .filter(
            func.date(Consultation.created_at)
            == func.current_date(),
            func.lower(Consultation.status).in_(
                ["in_progress", "in progress"]
            ),
        )
        .count()
    )

    today_completed = (
        db.query(Consultation)
        .filter(
            func.date(Consultation.created_at)
            == func.current_date(),
            func.lower(Consultation.status)
            == "completed",
        )
        .count()
    )

    emergency_consultations = (
        db.query(Consultation)
        .filter(
            func.lower(Consultation.priority)
            == "emergency"
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

    total_hospitals = db.query(Hospital).count()

    active_hospitals = (
        db.query(Hospital)
        .filter(Hospital.is_active.is_(True))
        .count()
    )

    inactive_hospitals = (
        db.query(Hospital)
        .filter(Hospital.is_active.is_(False))
        .count()
    )

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_admins": total_admins,

        "total_consultations": total_consultations,
        "today_consultations": today_consultations,

        "pending_consultations": pending_consultations,
        "in_progress_consultations": in_progress_consultations,
        "completed_consultations": completed_consultations,
        "reviewed_consultations": reviewed_consultations,
        "referred_consultations": referred_consultations,

        "today_pending": today_pending,
        "today_in_progress": today_in_progress,
        "today_completed": today_completed,

        "emergency_consultations": emergency_consultations,

        "assigned_consultations": assigned_consultations,
        "unassigned_consultations": unassigned_consultations,

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
    hospital_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    query = (
        db.query(User)
        .filter(
            User.role == "doctor",
            User.is_active.is_(True),
        )
    )

    if hospital_id is not None:
        query = query.filter(
            User.hospital_id == hospital_id
        )

    doctors = (
        query
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        user_to_response(doctor)
        for doctor in doctors
    ]


# ============================================================
# GET DOCTORS FOR ONE HOSPITAL
# ============================================================


@router.get("/hospitals/{hospital_id}/doctors")
def get_hospital_doctors(
    hospital_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    hospital = (
        db.query(Hospital)
        .filter(Hospital.id == hospital_id)
        .first()
    )

    if hospital is None:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    doctors = (
        db.query(User)
        .filter(
            User.role == "doctor",
            User.hospital_id == hospital_id,
        )
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        user_to_response(doctor)
        for doctor in doctors
    ]


# ============================================================
# CREATE DOCTOR FOR HOSPITAL
# ============================================================


@router.post(
    "/hospitals/{hospital_id}/doctors",
    status_code=status.HTTP_201_CREATED,
)
def create_hospital_doctor(
    hospital_id: int,
    doctor_data: AdminDoctorCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    if doctor_data.hospital_id != hospital_id:
        raise HTTPException(
            status_code=400,
            detail="Hospital ID mismatch.",
        )

    hospital = (
        db.query(Hospital)
        .filter(
            Hospital.id == hospital_id,
            Hospital.is_active.is_(True),
        )
        .first()
    )

    if hospital is None:
        raise HTTPException(
            status_code=404,
            detail="Active hospital not found.",
        )

    existing = (
        db.query(User)
        .filter(
            User.email == doctor_data.email
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )

    doctor = User(
        full_name=doctor_data.full_name.strip(),
        email=doctor_data.email,
        phone=doctor_data.phone.strip(),
        village="",
        department=doctor_data.department.strip(),
        hospital_id=hospital_id,
        password_hash=hash_password(
          doctor_data.password

        ),
        role="doctor",
        is_active=True,
    )

    db.add(doctor)

    try:
        db.commit()
        db.refresh(doctor)
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to create doctor.",
        )

    return user_to_response(doctor)


# ============================================================
# UPDATE DOCTOR
# ============================================================


@router.patch(
    "/doctors/{doctor_id}"
)
def update_doctor(
    doctor_id: int,
    update_data: AdminDoctorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    doctor = (
        db.query(User)
        .filter(
            User.id == doctor_id,
            User.role == "doctor",
        )
        .first()
    )

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found.",
        )

    if update_data.hospital_id is not None:
        hospital = (
            db.query(Hospital)
            .filter(
                Hospital.id == update_data.hospital_id,
                Hospital.is_active.is_(True),
            )
            .first()
        )

        if hospital is None:
            raise HTTPException(
                status_code=404,
                detail="Hospital not found.",
            )

        doctor.hospital_id = update_data.hospital_id

    if update_data.full_name is not None:
        doctor.full_name = update_data.full_name.strip()

    if update_data.phone is not None:
        doctor.phone = update_data.phone.strip()

    if update_data.department is not None:
        doctor.department = (
            update_data.department.strip()
        )

    if update_data.is_active is not None:
        doctor.is_active = update_data.is_active

    try:
        db.commit()
        db.refresh(doctor)
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update doctor.",
        )

    return user_to_response(doctor)


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
        .filter(User.id == user_id)
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
#
# IMPORTANT:
#
# is_active=False NOW MEANS:
#     account becomes inactive.
#
# It does NOT delete the user.
#
# Permanent deletion is handled by DELETE below.
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
        .filter(User.id == user_id)
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
        and update_data.hospital_id is None
        and update_data.department is None
    ):
        raise HTTPException(
            status_code=400,
            detail="No update data supplied.",
        )

    # ---------------------------------------------------------
    # NEVER DEACTIVATE OWN ADMIN
    # ---------------------------------------------------------

    if (
        user.id == current_user.id
        and update_data.is_active is False
    ):
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account.",
        )

    # ---------------------------------------------------------
    # NEVER REMOVE OWN ADMIN ROLE
    # ---------------------------------------------------------

    if (
        user.id == current_user.id
        and update_data.role is not None
        and update_data.role.lower().strip() != "admin"
    ):
        raise HTTPException(
            status_code=400,
            detail="You cannot remove your own admin role.",
        )

    # ---------------------------------------------------------
    # ROLE
    # ---------------------------------------------------------

    if update_data.role is not None:

        role = update_data.role.strip().lower()

        allowed_roles = {
            "patient",
            "doctor",
            "admin",
        }

        if role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid role. Allowed roles: "
                    "patient, doctor, admin."
                ),
            )

        user.role = role

    # ---------------------------------------------------------
    # STATUS
    # ---------------------------------------------------------

    if update_data.is_active is not None:
        user.is_active = update_data.is_active

        # If doctor becomes inactive,
        # remove them from assigned consultations.
        if (
            user.role == "doctor"
            and update_data.is_active is False
        ):
            db.query(Consultation).filter(
                Consultation.doctor_id == user.id
            ).update(
                {
                    Consultation.doctor_id: None,
                    Consultation.status: "pending",
                },
                synchronize_session=False,
            )

    # ---------------------------------------------------------
    # HOSPITAL
    # ---------------------------------------------------------

    if update_data.hospital_id is not None:

        hospital = (
            db.query(Hospital)
            .filter(
                Hospital.id == update_data.hospital_id
            )
            .first()
        )

        if hospital is None:
            raise HTTPException(
                status_code=404,
                detail="Hospital not found.",
            )

        user.hospital_id = update_data.hospital_id

    # ---------------------------------------------------------
    # DEPARTMENT
    # ---------------------------------------------------------

    if update_data.department is not None:
        user.department = (
            update_data.department.strip()
        )

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
# PERMANENT DELETE USER
# ============================================================


@router.delete("/users/{user_id}")
def delete_user_permanently(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot permanently delete your own account.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Remove doctor assignment first.
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

    # Delete patient's consultations.
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

    try:
        db.delete(user)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to permanently delete user. "
                "The user may still be referenced by "
                "another database record."
            ),
        )

    return {
        "success": True,
        "message": "User permanently deleted.",
        "user_id": user_id,
    }


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
            User.id == assignment.doctor_id
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
            detail="Selected user is not a doctor.",
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot assign consultation to an inactive doctor.",
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
            detail="Unable to assign doctor.",
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
            detail="Unable to unassign doctor.",
        )

    return consultation_to_response_data(
        consultation,
        db,
    )