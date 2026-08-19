from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.consultations import router as consultations_router
from app.api.doctor import router as doctor_router
from app.api.admin import router as admin_router


print("Auth routes:", len(auth_router.routes))
print("Users routes:", len(users_router.routes))
print("Consultation routes:", len(consultations_router.routes))
print("Doctor routes:", len(doctor_router.routes))
print("Admin routes:", len(admin_router.routes))


app = FastAPI(
    title="AI Hospital Patient Assistant"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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


print("All routes registered")


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Welcome to AI Hospital Patient Assistant API",
    }