from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(
    db: Session,
    email: str,
):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def create_user(
    db: Session,
    user,
):
    from app.core.security import hash_password

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        village=user.village,
        password_hash=hash_password(user.password),
        role="patient",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = get_user_by_email(db, email)

    if user is None:
        return None

    from app.core.security import verify_password

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user