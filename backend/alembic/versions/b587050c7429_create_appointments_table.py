"""Create appointments table

Revision ID: b587050c7429
Revises: 16471d630903
Create Date: 2026-09-04 20:59:43.491796

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b587050c7429"
down_revision: Union[str, Sequence[str], None] = "16471d630903"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "appointments",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "patient_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "hospital_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "doctor_id",
            sa.Integer(),
            nullable=True,
        ),

        sa.Column(
            "consultation_id",
            sa.Integer(),
            nullable=True,
        ),

        sa.Column(
            "department",
            sa.String(length=100),
            nullable=False,
        ),

        sa.Column(
            "appointment_date",
            sa.Date(),
            nullable=False,
        ),

        sa.Column(
            "appointment_time",
            sa.Time(),
            nullable=False,
        ),

        sa.Column(
            "queue_number",
            sa.Integer(),
            nullable=True,
        ),

        sa.Column(
            "priority",
            sa.String(length=20),
            nullable=False,
            server_default="Low",
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="booked",
        ),

        sa.Column(
            "notes",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["users.id"],
        ),

        sa.ForeignKeyConstraint(
            ["hospital_id"],
            ["hospitals.id"],
        ),

        sa.ForeignKeyConstraint(
            ["doctor_id"],
            ["users.id"],
        ),

        sa.ForeignKeyConstraint(
            ["consultation_id"],
            ["consultations.id"],
        ),
    )

    op.create_index(
        "ix_appointments_patient_id",
        "appointments",
        ["patient_id"],
    )

    op.create_index(
        "ix_appointments_hospital_id",
        "appointments",
        ["hospital_id"],
    )

    op.create_index(
        "ix_appointments_doctor_id",
        "appointments",
        ["doctor_id"],
    )

    op.create_index(
        "ix_appointments_consultation_id",
        "appointments",
        ["consultation_id"],
    )

    op.create_index(
        "ix_appointments_appointment_date",
        "appointments",
        ["appointment_date"],
    )

    op.create_index(
        "ix_appointments_queue_number",
        "appointments",
        ["queue_number"],
    )

    op.create_index(
        "ix_appointments_status",
        "appointments",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_appointments_status",
        table_name="appointments",
    )

    op.drop_index(
        "ix_appointments_queue_number",
        table_name="appointments",
    )

    op.drop_index(
        "ix_appointments_appointment_date",
        table_name="appointments",
    )

    op.drop_index(
        "ix_appointments_consultation_id",
        table_name="appointments",
    )

    op.drop_index(
        "ix_appointments_doctor_id",
        table_name="appointments",
    )

    op.drop_index(
        "ix_appointments_hospital_id",
        table_name="appointments",
    )

    op.drop_index(
        "ix_appointments_patient_id",
        table_name="appointments",
    )

    op.drop_table("appointments")