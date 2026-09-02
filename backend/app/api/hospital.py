from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalCreate, HospitalResponse
from app.core.security import require_role


router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"],
)


# ============================================================
# CREATE HOSPITAL
# ADMIN ONLY
# ============================================================

@router.post(
    "/",
    response_model=HospitalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_hospital(
    hospital_data: HospitalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    existing = (
        db.query(Hospital)
        .filter(Hospital.qr_code_id == hospital_data.qr_code_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="QR code ID already exists",
        )

    hospital = Hospital(
        name=hospital_data.name,
        address=hospital_data.address,
        phone=hospital_data.phone,
        email=hospital_data.email,
        qr_code_id=hospital_data.qr_code_id,
        is_active=True,
    )

    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    return hospital


# ============================================================
# LOOKUP HOSPITAL BY QR CODE
# PATIENT ACCESS
# ============================================================

@router.get(
    "/qr/{qr_code_id}",
    response_model=HospitalResponse,
)
def get_hospital_by_qr(
    qr_code_id: str,
    db: Session = Depends(get_db),
):
    hospital = (
        db.query(Hospital)
        .filter(
            Hospital.qr_code_id == qr_code_id,
            Hospital.is_active.is_(True),
        )
        .first()
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    return hospital


# ============================================================
# LIST ACTIVE HOSPITALS
# ============================================================

@router.get(
    "/",
    response_model=list[HospitalResponse],
)
def list_hospitals(
    db: Session = Depends(get_db),
):
    hospitals = (
        db.query(Hospital)
        .filter(Hospital.is_active.is_(True))
        .order_by(Hospital.name.asc())
        .all()
    )

    return hospitals