from pydantic import BaseModel


class ConsultationUpdate(BaseModel):
    doctor_notes: str
    status: str