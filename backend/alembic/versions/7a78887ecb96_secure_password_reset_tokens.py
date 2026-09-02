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
    Secure password reset tokens.

    Handles both cases:

    1. Existing old password_reset_tokens table:
       migrate plaintext token -> SHA-256 token_hash.

    2. Missing password_reset_tokens table:
       create the secure table directly.

    This makes the migration safe for the existing Render database,
    where Alembic reports revision 5a8a224b3fd9 but the table is missing.
    """

    connection = op.get_bind()

    # ------------------------------------------------------------
    # Check whether password_reset_tokens already exists
    # ------------------------------------------------------------

    table_exists = connection.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'password_reset_tokens'
            )
            """
        )
    ).scalar()

    # ------------------------------------------------------------
    # Case 1: table does not exist
    # ------------------------------------------------------------

    if not table_exists:
        op.create_table(
            "password_reset_tokens",
            sa.Column(
                "id",
                sa.Integer(),
                primary_key=True,
                nullable=False,
            ),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey(
                    "users.id",
                    ondelete="CASCADE",
                ),
                nullable=False,
            ),
            sa.Column(
                "token_hash",
                sa.String(length=64),
                nullable=False,
                unique=True,
            ),
            sa.Column(
                "expires_at",
                sa.DateTime(timezone=True),
                nullable=False,
            ),
        )

        op.create_index(
            "ix_password_reset_tokens_user_id",
            "password_reset_tokens",
            ["user_id"],
            unique=False,
        )

        op.create_index(
            "ix_password_reset_tokens_token_hash",
            "password_reset_tokens",
            ["token_hash"],
            unique=True,
        )

        return

    # ------------------------------------------------------------
    # Case 2: table already exists
    # ------------------------------------------------------------

    # Check whether token_hash already exists.
    token_hash_exists = connection.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'password_reset_tokens'
                AND column_name = 'token_hash'
            )
            """
        )
    ).scalar()

    # ------------------------------------------------------------
    # Existing old table: convert plaintext token
    # ------------------------------------------------------------

    if not token_hash_exists:

        op.add_column(
            "password_reset_tokens",
            sa.Column(
                "token_hash",
                sa.String(length=64),
                nullable=True,
            ),
        )

        # --------------------------------------------------------
        # Convert existing plaintext tokens to SHA-256 hashes
        # --------------------------------------------------------

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

        # --------------------------------------------------------
        # Remove old plaintext token index
        # --------------------------------------------------------

        op.drop_index(
            op.f("ix_password_reset_tokens_token"),
            table_name="password_reset_tokens",
        )

        # --------------------------------------------------------
        # Make token_hash required
        # --------------------------------------------------------

        op.alter_column(
            "password_reset_tokens",
            "token_hash",
            existing_type=sa.String(length=64),
            nullable=False,
        )

        # --------------------------------------------------------
        # Create unique index for token_hash
        # --------------------------------------------------------

        op.create_index(
            op.f("ix_password_reset_tokens_token_hash"),
            "password_reset_tokens",
            ["token_hash"],
            unique=True,
        )

        # --------------------------------------------------------
        # Remove plaintext token column
        # --------------------------------------------------------

        op.drop_column(
            "password_reset_tokens",
            "token",
        )

    # ------------------------------------------------------------
    # Already-secure table: nothing to do
    # ------------------------------------------------------------


def downgrade() -> None:
    """
    Downgrade is intentionally conservative.

    For an already-secure table created by the upgrade path,
    remove the table.

    For an old table migrated to token_hash, restore the plaintext
    token column as nullable because hashes cannot be reversed.
    """

    connection = op.get_bind()

    table_exists = connection.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'password_reset_tokens'
            )
            """
        )
    ).scalar()

    if not table_exists:
        return

    token_exists = connection.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'password_reset_tokens'
                AND column_name = 'token'
            )
            """
        )
    ).scalar()

    token_hash_exists = connection.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'password_reset_tokens'
                AND column_name = 'token_hash'
            )
            """
        )
    ).scalar()

    # If this migration created the table from scratch,
    # remove the table during downgrade.
    if token_hash_exists and not token_exists:
        op.drop_table("password_reset_tokens")
        return

    # Otherwise restore the old token column.
    if token_hash_exists:

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