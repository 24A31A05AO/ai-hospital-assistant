import os

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


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Hospital Patient Assistant"
)


# ============================================================
# DEBUG ROUTE COUNTS
# ============================================================

print("========== ROUTE DEBUG ==========")
print("Auth routes:", len(auth_router.routes))
print("Users routes:", len(users_router.routes))
print("Consultation routes:", len(consultations_router.routes))
print("Doctor routes:", len(doctor_router.routes))
print("Admin routes:", len(admin_router.routes))
print("Hospital routes:", len(hospital_router.routes))
print("WhatsApp routes:", len(whatsapp_router.routes))
print("=================================")


# ============================================================
# HEALTH CHECK
# ============================================================

@app.head("/")
def head_root():
    return Response(status_code=200)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Welcome to AI Hospital Patient Assistant API",
    }


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    "https://ai-hospital-frontend.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

print("========== CORS DEBUG ==========")
print("ALLOWED_ORIGINS =", ALLOWED_ORIGINS)
print("=================================")


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REGISTER API ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(consultations_router)
app.include_router(doctor_router)
app.include_router(admin_router)
app.include_router(hospital_router)
app.include_router(whatsapp_router)


print("========== ALL ROUTES REGISTERED ==========")

for route in app.routes:
    methods = getattr(route, "methods", None)

    if methods:
        print(
            f"{sorted(methods)} {route.path}"
        )

print("==========================================")