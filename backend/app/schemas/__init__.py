from pydantic import BaseModel, Field


class ConsultationCreate(BaseModel):
    chief_complaint: str = Field(..., min_length=3, max_length=255)


class ConsultationResponse(BaseModel):
    id: int
    user_id: int
    chief_complaint: str
    symptoms: str | None = None
    medical_history: str | None = None
    medications: str | None = None
    allergies: str | None = None
    ai_summary: str | None = None
    department: str | None = None
    priority: str
    status: str

    class Config:
        from_attributes = True