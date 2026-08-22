"""add doctor_id to consultations

Revision ID: 5a8a224b3fd9
Revises: 29e0772dacb6
Create Date: 2026-08-22 17:18:47.244473

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a8a224b3fd9'
down_revision: Union[str, Sequence[str], None] = '29e0772dacb6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE consultations
        ADD COLUMN IF NOT EXISTS doctor_id INTEGER
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_consultations_doctor_id
        ON consultations (doctor_id)
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'fk_consultations_doctor_id_users'
            ) THEN
                ALTER TABLE consultations
                ADD CONSTRAINT fk_consultations_doctor_id_users
                FOREIGN KEY (doctor_id)
                REFERENCES users(id);
            END IF;
        END
        $$;
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE consultations
        DROP CONSTRAINT IF EXISTS fk_consultations_doctor_id_users
    """)

    op.execute("""
        DROP INDEX IF EXISTS ix_consultations_doctor_id
    """)

    op.execute("""
        ALTER TABLE consultations
        DROP COLUMN IF EXISTS doctor_id
    """)
