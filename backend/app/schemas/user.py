from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)

    village: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=72,
    )


class UserRegister(UserCreate):
    pass


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    village: str
    department: str | None = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True