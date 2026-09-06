from app.db.session import engine

from app.models.base import Base
from app.models.user import User
from app.models.consultation import Consultation
from app.models.hospital import Hospital
from app.models.appointment import Appointment
from app.models.doctor_availability import DoctorAvailability


def create_tables():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")