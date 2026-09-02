from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HospitalCreate(BaseModel):
    name: str
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    qr_code_id: str


class HospitalResponse(BaseModel):
    id: int
    name: str
    address: str | None
    phone: str | None
    email: str | None
    qr_code_id: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)