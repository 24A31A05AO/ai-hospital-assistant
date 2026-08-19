from sqlalchemy.orm import Session

from app.models.consultation import Consultation


def get_all_consultations(db: Session):
    return (
        db.query(Consultation)
        .order_by(Consultation.created_at.desc())
        .all()
    )


def update_consultation(
    db: Session,
    consultation_id: int,
    doctor_notes: str,
    status: str,
):
    consultation = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if consultation is None:
        return None

    consultation.doctor_notes = doctor_notes
    consultation.status = status

    db.commit()
    db.refresh(consultation)

    return consultation