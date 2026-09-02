from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.consultations import router as consultations_router
from app.api.doctor import router as doctor_router
from app.api.admin import router as admin_router
from app.api.hospital import router as hospital_router
from app.whatsapp.routes import router as whatsapp_router


app = FastAPI(
    title="AI Hospital Patient Assistant"
)


@app.head("/")
def head_root():
    return Response(status_code=200)


# CORS
ALLOWED_ORIGINS = [
    "https://ai-hospital-frontend.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(consultations_router)
app.include_router(doctor_router)
app.include_router(admin_router)
app.include_router(hospital_router)
app.include_router(whatsapp_router)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Welcome to AI Hospital Patient Assistant API",
    }