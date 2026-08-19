from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.models.user import User
from app.models.password_reset import PasswordResetToken

from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
)

from app.schemas.user import UserCreate

from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new patient account.
    """

    # --------------------------------------------------------
    # Check whether email already exists
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # --------------------------------------------------------
    # New registrations are patients by default
    # --------------------------------------------------------

    new_user = User(
    full_name=user_data.full_name,
    email=user_data.email,
    phone=user_data.phone,
    village=user_data.village,
    password_hash=hash_password(
        user_data.password
    ),
    role="patient",
    is_active=True,
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
    "message": "Registration successful",
    "user": {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "phone": new_user.phone,
        "village": new_user.village,
        "role": new_user.role,
        "is_active": new_user.is_active,
    },
}


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login using email and password.

    OAuth2PasswordRequestForm uses:

        username = email
        password = password
    """

    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # Check account status
    # --------------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # --------------------------------------------------------
    # Verify password
    # --------------------------------------------------------

    if not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # JWT payload
    # --------------------------------------------------------

    token_data = {
        "sub": user.email,
        "role": user.role,
        "user_id": user.id,
    }

    access_token = create_access_token(
        data=token_data
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a password reset token.

    DEVELOPMENT VERSION:
    The reset token is returned in the response.

    PRODUCTION:
    This token should be sent through email instead.
    """

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    # Don't reveal whether an email exists
    if user is None:
        return {
            "message": (
                "If an account exists with this email, "
                "password reset instructions have been sent."
            )
        }

    # --------------------------------------------------------
    # Delete previous reset tokens
    # --------------------------------------------------------

    (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id
        )
        .delete(
            synchronize_session=False
        )
    )

    # --------------------------------------------------------
    # Generate secure random token
    # --------------------------------------------------------

    token = secrets.token_urlsafe(32)

    # Token expires after 30 minutes
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=30)
    )

    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
    )

    db.add(reset_token)
    db.commit()

    # --------------------------------------------------------
    # Development terminal output
    # --------------------------------------------------------

    print(
        "\n========================================"
    )
    print("PASSWORD RESET")
    print(f"Email: {user.email}")
    print(f"Token: {token}")
    print(
        "========================================\n"
    )

    return {
        "message": (
            "If an account exists with this email, "
            "password reset instructions have been sent."
        ),

        # DEVELOPMENT ONLY
        "development_token": token,
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset password using a valid reset token.
    """

    # --------------------------------------------------------
    # Find reset token
    # --------------------------------------------------------

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == request.token
        )
        .first()
    )

    # Token doesn't exist
    if reset_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # --------------------------------------------------------
    # Current time
    # --------------------------------------------------------

    now = datetime.now(timezone.utc)

    # Handle timezone-naive PostgreSQL datetime
    expires_at = reset_token.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    # --------------------------------------------------------
    # Check expiration
    # --------------------------------------------------------

    if expires_at <= now:

        db.delete(reset_token)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == reset_token.user_id
        )
        .first()
    )

    if user is None:

        db.delete(reset_token)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    # --------------------------------------------------------
    # Hash the NEW password
    # --------------------------------------------------------

    user.password_hash = hash_password(
        request.new_password
    )

    # Delete token so it cannot be reused
    db.delete(reset_token)

    db.commit()
    db.refresh(user)

    return {
        "message": (
            "Password reset successful. "
            "You can now log in with your new password."
        )
    }