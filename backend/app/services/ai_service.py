from typing import Literal

from google import genai
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# ============================================================
# AI RESPONSE SCHEMA
# ============================================================

class AIConsultationResult(BaseModel):
    """
    Strict schema for the AI preliminary assessment.

    This is NOT a medical diagnosis.
    """

    summary: str = Field(
        min_length=1,
        max_length=2000,
    )

    department: str = Field(
        min_length=1,
        max_length=100,
    )

    priority: Literal[
        "Low",
        "Medium",
        "High",
        "Emergency",
    ]

    possible_conditions: list[str] = Field(
        default_factory=list,
        max_length=5,
    )

    recommended_tests: list[str] = Field(
        default_factory=list,
        max_length=5,
    )

    red_flags: list[str] = Field(
        default_factory=list,
        max_length=10,
    )


# ============================================================
# SAFETY CONSTANTS
# ============================================================

EMERGENCY_KEYWORDS = {
    "chest pain",
    "difficulty breathing",
    "shortness of breath",
    "severe bleeding",
    "unconscious",
    "loss of consciousness",
    "stroke",
    "seizure",
    "severe allergic reaction",
    "anaphylaxis",
    "suicidal",
    "suicide",
}


# ============================================================
# BASIC EMERGENCY SAFETY CHECK
# ============================================================

def contains_emergency_indicator(
    text: str,
) -> bool:
    """
    Basic deterministic safety layer.

    This does NOT diagnose an emergency.
    It only detects obvious high-risk phrases and
    prevents the AI from returning a lower priority.
    """

    normalized = text.lower()

    return any(
        keyword in normalized
        for keyword in EMERGENCY_KEYWORDS
    )


# ============================================================
# ANALYZE CONSULTATION
# ============================================================

def analyze_consultation(
    chief_complaint: str,
    symptoms: str,
    medical_history: str | None = None,
    medications: str | None = None,
    allergies: str | None = None,
):
    """
    Perform preliminary AI triage.

    IMPORTANT:
    This function provides decision-support information only.
    It does NOT provide a definitive diagnosis or replace
    assessment by a qualified healthcare professional.
    """

    patient_information = f"""
Chief complaint:
{chief_complaint}

Symptoms:
{symptoms}

Medical history:
{medical_history or "None provided"}

Current medications:
{medications or "None provided"}

Allergies:
{allergies or "None provided"}
"""

    prompt = f"""
You are an AI hospital patient-assistant system.

You provide PRELIMINARY TRIAGE SUPPORT ONLY.

You are NOT a doctor.
You must NOT provide a definitive diagnosis.
Your output must never be presented as a confirmed medical diagnosis.

Patient information:

{patient_information}

Your task:

1. Summarize the patient's reported information.
2. Suggest the most appropriate hospital department.
3. Assign a preliminary priority:
   Low, Medium, High, or Emergency.
4. List possible conditions only as possibilities.
5. Suggest potentially relevant investigations.
6. Identify important red flags.

Safety rules:

- Never claim that a condition is definitely present.
- Never tell the patient that they are medically cleared.
- Never replace emergency medical care.
- If information suggests a possible emergency, use Emergency.
- Keep the response concise.
- Do not provide medication dosage instructions.
- Do not recommend stopping prescribed medication.
- Do not invent patient information.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": AIConsultationResult,
            },
        )

    except Exception as exc:
        # Do not expose the provider's internal error
        # to the patient.
        raise RuntimeError(
            "AI assessment service is temporarily unavailable."
        ) from exc

    # ========================================================
    # CHECK RESPONSE
    # ========================================================

    if not response.text:
        raise RuntimeError(
            "AI assessment service returned an empty response."
        )

    try:
        result = AIConsultationResult.model_validate_json(
            response.text
        )

    except ValidationError as exc:
        raise RuntimeError(
            "AI assessment returned an invalid response."
        ) from exc

    # ========================================================
    # DETERMINISTIC SAFETY OVERRIDE
    # ========================================================

    combined_text = " ".join(
        [
            chief_complaint or "",
            symptoms or "",
            medical_history or "",
        ]
    )

    if contains_emergency_indicator(
        combined_text
    ):
        result.priority = "Emergency"

        emergency_message = (
            "Potential emergency warning signs were identified. "
            "Immediate assessment by qualified medical professionals "
            "is recommended."
        )

        if emergency_message not in result.red_flags:
            result.red_flags.insert(
                0,
                emergency_message,
            )

    # ========================================================
    # FINAL RESULT
    # ========================================================

    return result.model_dump()