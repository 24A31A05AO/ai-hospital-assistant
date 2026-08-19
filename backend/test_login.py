from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()

email = "doctor@test.com"
password = "Doctor@123"

user = db.query(User).filter(User.email == email).first()

if user is None:
    print("USER NOT FOUND")
else:
    print("USER FOUND")
    print("ID:", user.id)
    print("EMAIL:", user.email)
    print("ROLE:", user.role)
    print("ACTIVE:", user.is_active)
    print("PASSWORD MATCH:", verify_password(password, user.password_hash))

db.close()
