
"""add doctor id to consultations

Revision ID: 29e0772dacb6
Revises: 449bebcc3d92
Create Date: 2026-08-22 11:43:57.249714

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "29e0772dacb6"
down_revision: Union[str, Sequence[str], None] = "449bebcc3d92"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add doctor_id to consultations."""
    op.add_column(
        "consultations",
        sa.Column(
            "doctor_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_consultations_doctor_id_users",
        "consultations",
        "users",
        ["doctor_id"],
        ["id"],
    )

    op.create_index(
        "ix_consultations_doctor_id",
        "consultations",
        ["doctor_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove doctor_id from consultations."""
    op.drop_index(
        "ix_consultations_doctor_id",
        table_name="consultations",
    )

    op.drop_constraint(
        "fk_consultations_doctor_id_users",
        "consultations",
        type_="foreignkey",
    )

    op.drop_column(
        "consultations",
        "doctor_id",
    )

