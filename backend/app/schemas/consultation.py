from datetime import datetime

from pydantic import BaseModel


# ============================================================
# PATIENT INFORMATION
# ============================================================

class PatientInfo(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    village: str | None = None
    role: str

    model_config = {
        "from_attributes": True
    }


# ============================================================
# DOCTOR INFORMATION
# ============================================================

class DoctorInfo(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    village: str | None = None
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }


# ============================================================
# CREATE CONSULTATION
# ============================================================

class ConsultationCreate(BaseModel):
    chief_complaint: str
    symptoms: str

    medical_history: str | None = None
    medications: str | None = None
    allergies: str | None = None


# ============================================================
# CONSULTATION RESPONSE
# ============================================================

class ConsultationResponse(BaseModel):
    # --------------------------------------------------------
    # Consultation identity
    # --------------------------------------------------------

    id: int
    user_id: int

    # --------------------------------------------------------
    # Patient
    # --------------------------------------------------------

    patient: PatientInfo | None = None

    # --------------------------------------------------------
    # Assigned doctor
    # --------------------------------------------------------

    doctor_id: int | None = None
    doctor: DoctorInfo | None = None

    # --------------------------------------------------------
    # Patient information
    # --------------------------------------------------------

    chief_complaint: str
    symptoms: str | None = None

    medical_history: str | None = None
    medications: str | None = None
    allergies: str | None = None

    # --------------------------------------------------------
    # AI analysis
    # --------------------------------------------------------

    ai_summary: str | None = None

    possible_conditions: list[str]
    recommended_tests: list[str]
    red_flags: list[str]

    # --------------------------------------------------------
    # Classification
    # --------------------------------------------------------

    department: str | None = None
    priority: str
    status: str

    # --------------------------------------------------------
    # Doctor review
    # --------------------------------------------------------

    doctor_notes: str | None = None

    # --------------------------------------------------------
    # Date
    # --------------------------------------------------------

    created_at: datetime

    model_config = {
        "from_attributes": True
    }