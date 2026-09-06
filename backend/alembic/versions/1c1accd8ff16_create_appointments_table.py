"""Mark existing appointments table as created.

Revision ID: b587050c7429
Revises: 16471d630903
Create Date: 2026-09-04 20:59:43.491796
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b587050c7429"
down_revision: Union[str, Sequence[str], None] = "16471d630903"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The appointments table already exists in the database.
    # This migration only synchronizes Alembic's migration history.
    pass


def downgrade() -> None:
    # Do not remove the existing appointments table.
    pass