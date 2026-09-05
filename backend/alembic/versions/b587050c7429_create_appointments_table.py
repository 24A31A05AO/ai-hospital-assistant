"""Sync appointments table migration.

Revision ID: b587050c7429
Revises: 16471d630903
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b587050c7429"
down_revision: Union[str, Sequence[str], None] = "16471d630903"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # appointments was already created by
    # migration 16471d630903.
    pass


def downgrade() -> None:
    # Keep the existing appointments table.
    pass