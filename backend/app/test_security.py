from app.core.security import hash_password, verify_password

password = "Hospital123"

hashed = hash_password(password)

print("Hashed Password:", hashed)

print("Password Match:", verify_password(password, hashed))