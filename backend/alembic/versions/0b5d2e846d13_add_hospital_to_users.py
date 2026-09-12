"""add hospital to users

Revision ID: 0b5d2e846d13
Revises: b587050c7429
Create Date: 2026-09-12 08:45:28.347420

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0b5d2e846d13"
down_revision = "b587050c7429"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column(
            "hospital_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_users_hospital_id",
        "users",
        ["hospital_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_users_hospital_id_hospitals",
        "users",
        "hospitals",
        ["hospital_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint(
        "fk_users_hospital_id_hospitals",
        "users",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_users_hospital_id",
        table_name="users",
    )

    op.drop_column(
        "users",
        "hospital_id",
    )