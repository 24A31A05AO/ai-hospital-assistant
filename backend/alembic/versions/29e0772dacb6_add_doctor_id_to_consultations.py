"""add doctor id to consultations

Revision ID: 29e0772dacb6
Revises: 449bebcc3d92
Create Date: 2026-08-22 11:43:57.249714

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "29e0772dacb6"
down_revision: Union[str, Sequence[str], None] = "449bebcc3d92"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Doctor ID already exists in the database."""
    pass


def downgrade() -> None:
    """Do not remove doctor_id."""
    pass