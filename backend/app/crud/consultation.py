
import json

from sqlalchemy.orm import Session

from app.models.consultation import Consultation
from app.models.user import User
from app.schemas.consultation import ConsultationCreate
from app.services.ai_service import analyze_consultation


# ============================================================
# CREATE CONSULTATION
# ============================================================

def create_consultation(
    db: Session,
    user_id: int,
    consultation: ConsultationCreate,
):
    """
    Save the patient's original information first.
    AI analysis is performed after the initial save so an AI
    service failure does not discard the consultation.
    """

    new_consultation = Consultation(
        user_id=user_id,
        chief_complaint=consultation.chief_complaint,
        symptoms=consultation.symptoms,
        medical_history=consultation.medical_history,
        medications=consultation.medications,
        allergies=consultation.allergies,
        ai_summary=None,
        possible_conditions=json.dumps([]),
        recommended_tests=json.dumps([]),
        red_flags=json.dumps([]),
        department=None,
        priority="Low",
        status="pending",
        ai_status="pending",
        doctor_id=None,
    )

    # Save the original patient information first.
    try:
        db.add(new_consultation)
        db.commit()
        db.refresh(new_consultation)
    except Exception:
        db.rollback()
        raise

    # Mark AI processing separately.
    try:
        new_consultation.ai_status = "processing"
        db.commit()

        ai = analyze_consultation(
            consultation.chief_complaint,
            consultation.symptoms,
            consultation.medical_history,
            consultation.medications,
            consultation.allergies,
        )

        # Store organizational information from the AI.
        new_consultation.ai_summary = ai.get("summary")
        new_consultation.department = ai.get("department")
        new_consultation.priority = ai.get("priority", "Low")
        new_consultation.red_flags = json.dumps(
            ai.get("red_flags", [])
        )
        new_consultation.ai_status = "completed"

        db.commit()
        db.refresh(new_consultation)

    except Exception:
        # The original consultation was already committed.
        # Roll back failed AI-related changes only.
        db.rollback()

        saved = (
            db.query(Consultation)
            .filter(Consultation.id == new_consultation.id)
            .first()
        )

        if saved is None:
            raise

        saved.ai_status = "failed"
        db.commit()
        db.refresh(saved)
        new_consultation = saved

    return consultation_to_response_data(
        new_consultation,
        db,
    )


# ============================================================
# SAFE JSON LIST PARSER
# ============================================================

def parse_json_list(value):
    """
    Convert a database text field into a Python list.
    Handles None, lists, JSON arrays, plain strings,
    and malformed legacy data.
    """

    if not value:
        return []

    if isinstance(value, list):
        return value

    try:
        parsed = json.loads(value)

        if isinstance(parsed, list):
            return parsed

        if parsed is None:
            return []

        return [str(parsed)]

    except (json.JSONDecodeError, TypeError):
        return [
            item.strip()
            for item in str(value)
            .replace(",", "\n")
            .splitlines()
            if item.strip()
        ]


# ============================================================
# CONVERT CONSULTATION TO API RESPONSE
# ============================================================

def consultation_to_response_data(
    consultation: Consultation,
    db: Session,
):
    """
    Return consultation information with separate patient
    and doctor details.
    """

    patient = (
        db.query(User)
        .filter(User.id == consultation.user_id)
        .first()
    )

    patient_data = None

    if patient:
        patient_data = {
            "id": patient.id,
            "full_name": patient.full_name,
            "email": patient.email,
            "phone": patient.phone,
            "village": patient.village or "",
            "role": patient.role,
            "is_active": patient.is_active,
        }

    doctor_data = None

    if consultation.doctor_id is not None:
        doctor = (
            db.query(User)
            .filter(User.id == consultation.doctor_id)
            .first()
        )

        if doctor:
            doctor_data = {
                "id": doctor.id,
                "full_name": doctor.full_name,
                "email": doctor.email,
                "phone": doctor.phone,
                "village": doctor.village or "",
                "role": doctor.role,
                "is_active": doctor.is_active,
            }

    return {
        # Consultation identity
        "id": consultation.id,
        "user_id": consultation.user_id,

        # Patient
        "patient": patient_data,

        # Doctor assignment
        "doctor_id": consultation.doctor_id,
        "doctor": doctor_data,

        # Original patient responses
        "chief_complaint": consultation.chief_complaint,
        "symptoms": consultation.symptoms,
        "medical_history": consultation.medical_history,
        "medications": consultation.medications,
        "allergies": consultation.allergies,

        # AI organization
        "ai_summary": consultation.ai_summary,
        "ai_status": consultation.ai_status,

        # Retained for compatibility with the existing API.
        # Do not use these fields to present AI diagnoses
        # or AI-generated test recommendations to patients.
        "possible_conditions": [],
        "recommended_tests": [],

        # Safety information
        "red_flags": parse_json_list(
            consultation.red_flags
        ),

        # Hospital classification
        "department": consultation.department,
        "priority": consultation.priority,
        "status": consultation.status,

        # Doctor review
        "doctor_notes": consultation.doctor_notes,

        # Date
        "created_at": consultation.created_at,
    }


# ============================================================
# GET PATIENT CONSULTATIONS
# ============================================================

def get_consultations_by_patient(
    db: Session,
    user_id: int,
):
    """Return consultations belonging to one patient."""

    consultations = (
        db.query(Consultation)
        .filter(Consultation.user_id == user_id)
        .order_by(Consultation.created_at.desc())
        .all()
    )

    return [
        consultation_to_response_data(item, db)
        for item in consultations
    ]


# ============================================================
# GET SINGLE CONSULTATION
# ============================================================

def get_consultation_by_id(
    db: Session,
    consultation_id: int,
):
    """Return a consultation by its ID."""

    return (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )


# ============================================================
# GET DOCTOR CONSULTATIONS
# ============================================================

def get_consultations_by_doctor(
    db: Session,
    doctor_id: int,
):
    """Return consultations assigned to a specific doctor."""

    consultations = (
        db.query(Consultation)
        .filter(Consultation.doctor_id == doctor_id)
        .order_by(Consultation.created_at.desc())
        .all()
    )

    return [
        consultation_to_response_data(item, db)
        for item in consultations
    ]
