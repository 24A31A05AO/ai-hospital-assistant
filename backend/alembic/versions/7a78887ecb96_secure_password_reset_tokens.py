"""secure password reset tokens

Revision ID: 7a78887ecb96
Revises: 5a8a224b3fd9
Create Date: 2026-08-30 10:50:48.070683

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import hashlib


# revision identifiers, used by Alembic.
revision: str = "7a78887ecb96"
down_revision: Union[str, Sequence[str], None] = "5a8a224b3fd9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Replace plaintext password-reset tokens with SHA-256 hashes.

    Existing reset tokens are hashed during migration so they remain
    usable without storing the plaintext token in the database.
    """

    # ------------------------------------------------------------
    # Add token_hash as nullable temporarily
    # ------------------------------------------------------------

    op.add_column(
        "password_reset_tokens",
        sa.Column(
            "token_hash",
            sa.String(length=64),
            nullable=True,
        ),
    )

    # ------------------------------------------------------------
    # Convert existing plaintext tokens to SHA-256 hashes
    # ------------------------------------------------------------

    connection = op.get_bind()

    rows = connection.execute(
        sa.text(
            """
            SELECT id, token
            FROM password_reset_tokens
            WHERE token IS NOT NULL
            """
        )
    ).fetchall()

    for row in rows:
        token_hash = hashlib.sha256(
            row.token.encode("utf-8")
        ).hexdigest()

        connection.execute(
            sa.text(
                """
                UPDATE password_reset_tokens
                SET token_hash = :token_hash
                WHERE id = :id
                """
            ),
            {
                "token_hash": token_hash,
                "id": row.id,
            },
        )

    # ------------------------------------------------------------
    # Remove old token index
    # ------------------------------------------------------------

    op.drop_index(
        op.f("ix_password_reset_tokens_token"),
        table_name="password_reset_tokens",
    )

    # ------------------------------------------------------------
    # Make token_hash required
    # ------------------------------------------------------------

    op.alter_column(
        "password_reset_tokens",
        "token_hash",
        existing_type=sa.String(length=64),
        nullable=False,
    )

    # ------------------------------------------------------------
    # Create unique index for token_hash
    # ------------------------------------------------------------

    op.create_index(
        op.f("ix_password_reset_tokens_token_hash"),
        "password_reset_tokens",
        ["token_hash"],
        unique=True,
    )

    # ------------------------------------------------------------
    # Remove plaintext token column
    # ------------------------------------------------------------

    op.drop_column(
        "password_reset_tokens",
        "token",
    )


def downgrade() -> None:
    """
    Restore the old plaintext token column.

    WARNING:
    Existing hashes cannot be converted back into plaintext tokens.
    Therefore downgrade creates an empty token column.
    """

    op.add_column(
        "password_reset_tokens",
        sa.Column(
            "token",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.drop_index(
        op.f("ix_password_reset_tokens_token_hash"),
        table_name="password_reset_tokens",
    )

    op.drop_column(
        "password_reset_tokens",
        "token_hash",
    )

    op.alter_column(
        "password_reset_tokens",
        "token",
        existing_type=sa.String(length=255),
        nullable=False,
    )

    op.create_index(
        op.f("ix_password_reset_tokens_token"),
        "password_reset_tokens",
        ["token"],
        unique=True,
    )