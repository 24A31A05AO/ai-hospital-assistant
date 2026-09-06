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
    is_active: bool

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
    """
    Information directly provided by the patient.

    These fields represent the patient's actual problem
    and must be preserved without being converted into
    an AI diagnosis.
    """

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
    # ORIGINAL PATIENT INFORMATION
    # --------------------------------------------------------

    # These fields are the patient's actual reported information.

    chief_complaint: str

    symptoms: str | None = None

    medical_history: str | None = None

    medications: str | None = None

    allergies: str | None = None

    # --------------------------------------------------------
    # AI ASSISTANCE
    # --------------------------------------------------------

    # Factual organization of patient information only.
    ai_summary: str | None = None

    # --------------------------------------------------------
    # DEPRECATED AI FIELDS
    # --------------------------------------------------------
    #
    # These remain temporarily for compatibility with the
    # existing database and older frontend code.
    #
    # They are intentionally always returned as empty lists.
    #
    # No possible conditions or recommended tests are generated.
    #

    possible_conditions: list[str] = []

    recommended_tests: list[str] = []

    # --------------------------------------------------------
    # SAFETY
    # --------------------------------------------------------

    red_flags: list[str] = []

    # --------------------------------------------------------
    # HOSPITAL CLASSIFICATION
    # --------------------------------------------------------

    department: str | None = None

    priority: str

    status: str

    # --------------------------------------------------------
    # DOCTOR REVIEW
    # --------------------------------------------------------

    doctor_notes: str | None = None

    # --------------------------------------------------------
    # DATE
    # --------------------------------------------------------

    created_at: datetime

    model_config = {
        "from_attributes": True
    }