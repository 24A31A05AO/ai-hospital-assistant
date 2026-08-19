from datetime import datetime

from pydantic import BaseModel


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


class ConsultationCreate(BaseModel):
    chief_complaint: str
    symptoms: str

    medical_history: str | None = None
    medications: str | None = None
    allergies: str | None = None


class ConsultationResponse(BaseModel):
    id: int
    user_id: int

    patient: PatientInfo | None = None

    chief_complaint: str
    symptoms: str | None

    medical_history: str | None
    medications: str | None
    allergies: str | None

    ai_summary: str | None

    possible_conditions: list[str]
    recommended_tests: list[str]
    red_flags: list[str]

    department: str | None
    priority: str
    status: str

    doctor_notes: str | None

    created_at: datetime

    model_config = {
        "from_attributes": True
    }