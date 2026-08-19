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
    Create a new patient consultation.

    The consultation is:
    - analyzed by the AI service
    - stored in the database
    - initially unassigned to a doctor
    - given a pending status
    """

    ai = analyze_consultation(
        consultation.chief_complaint,
        consultation.symptoms,
        consultation.medical_history,
        consultation.medications,
        consultation.allergies,
    )

    new_consultation = Consultation(
        user_id=user_id,

        chief_complaint=consultation.chief_complaint,
        symptoms=consultation.symptoms,
        medical_history=consultation.medical_history,
        medications=consultation.medications,
        allergies=consultation.allergies,

        ai_summary=ai.get("summary"),

        possible_conditions=json.dumps(
            ai.get("possible_conditions", [])
        ),

        recommended_tests=json.dumps(
            ai.get("recommended_tests", [])
        ),

        red_flags=json.dumps(
            ai.get("red_flags", [])
        ),

        department=ai.get("department"),

        priority=ai.get(
            "priority",
            "Low",
        ),

        status="pending",

        # New consultations are initially
        # not assigned to any doctor.
        doctor_id=None,
    )

    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)

    return consultation_to_response_data(
        new_consultation,
        db,
    )


# ============================================================
# SAFE JSON LIST PARSER
# ============================================================

def parse_json_list(value):
    """
    Safely convert a database Text field containing JSON
    into a Python list.

    Handles:
        None
        ""
        JSON arrays
        plain strings
        malformed/old data
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

    except (
        json.JSONDecodeError,
        TypeError,
    ):
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
    Convert a Consultation database object into
    a frontend-friendly dictionary.

    Includes:

    - Patient information
    - Assigned doctor information
    - AI analysis
    - Department
    - Priority
    - Status
    - Doctor notes
    """

    # ========================================================
    # FIND PATIENT
    # ========================================================

    patient = (
        db.query(User)
        .filter(
            User.id == consultation.user_id
        )
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

    # ========================================================
    # FIND ASSIGNED DOCTOR
    # ========================================================

    doctor_data = None

    if consultation.doctor_id is not None:

        doctor = (
            db.query(User)
            .filter(
                User.id == consultation.doctor_id
            )
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

    # ========================================================
    # RETURN CONSULTATION
    # ========================================================

    return {
        # ----------------------------------------------------
        # Consultation identity
        # ----------------------------------------------------

        "id": consultation.id,

        "user_id": consultation.user_id,

        # ----------------------------------------------------
        # Patient
        # ----------------------------------------------------

        "patient": patient_data,

        # ----------------------------------------------------
        # Doctor assignment
        # ----------------------------------------------------

        "doctor_id": consultation.doctor_id,

        "doctor": doctor_data,

        # ----------------------------------------------------
        # Patient information
        # ----------------------------------------------------

        "chief_complaint": consultation.chief_complaint,

        "symptoms": consultation.symptoms,

        "medical_history": consultation.medical_history,

        "medications": consultation.medications,

        "allergies": consultation.allergies,

        # ----------------------------------------------------
        # AI information
        # ----------------------------------------------------

        "ai_summary": consultation.ai_summary,

        "possible_conditions": parse_json_list(
            consultation.possible_conditions
        ),

        "recommended_tests": parse_json_list(
            consultation.recommended_tests
        ),

        "red_flags": parse_json_list(
            consultation.red_flags
        ),

        # ----------------------------------------------------
        # Classification
        # ----------------------------------------------------

        "department": consultation.department,

        "priority": consultation.priority,

        "status": consultation.status,

        # ----------------------------------------------------
        # Doctor review
        # ----------------------------------------------------

        "doctor_notes": consultation.doctor_notes,

        # ----------------------------------------------------
        # Date
        # ----------------------------------------------------

        "created_at": consultation.created_at,
    }


# ============================================================
# GET PATIENT CONSULTATIONS
# ============================================================

def get_consultations_by_patient(
    db: Session,
    user_id: int,
):
    """
    Return all consultations belonging
    to a specific patient.
    """

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.user_id == user_id
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
# GET SINGLE CONSULTATION
# ============================================================

def get_consultation_by_id(
    db: Session,
    consultation_id: int,
):
    """
    Return a single consultation by ID.

    Returns:
        Consultation database object
        or None if not found.
    """

    return (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id
        )
        .first()
    )

# ============================================================
# GET DOCTOR CONSULTATIONS
# ============================================================

def get_consultations_by_doctor(
    db: Session,
    doctor_id: int,
):
    """
    Return only consultations assigned
    to the specified doctor.
    """

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id == doctor_id
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