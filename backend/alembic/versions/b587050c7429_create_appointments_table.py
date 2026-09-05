"""Sync appointments table migration.

Revision ID: b587050c7429
Revises: 16471d630903
"""

from typing import Sequence, Union

from alembic import op


revision: str = "b587050c7429"
down_revision: Union[str, Sequence[str], None] = "16471d630903"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass