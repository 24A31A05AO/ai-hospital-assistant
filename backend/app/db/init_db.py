from app.db.session import engine
from app.models.base import Base
from app.models.user import User


def create_tables():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()
    print("✅ Database tables created successfully!")