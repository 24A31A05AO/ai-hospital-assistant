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
    AI assistance for organizing a patient's reported information.

    This system does NOT diagnose the patient and does NOT
    generate possible medical conditions.
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
    Detect obvious high-risk phrases.

    This does NOT diagnose an emergency.
    It only ensures that obvious emergency indicators
    are not assigned a lower priority by the AI.
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
    Organize patient-provided information for healthcare review.

    IMPORTANT:
    - This is NOT a medical diagnosis.
    - No possible conditions are generated.
    - No medical tests are recommended.
    - Patient-reported information is preserved.
    - AI only creates an organizational summary,
      suggests a hospital department, and assigns preliminary
      priority.
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

Your role is ONLY to organize information provided by the patient
for review by a qualified healthcare professional.

You are NOT a doctor.

DO NOT diagnose the patient.

DO NOT guess or invent medical conditions.

DO NOT generate possible diseases or conditions.

DO NOT recommend medical tests.

DO NOT prescribe medication.

DO NOT tell the patient that they are medically cleared.

DO NOT change, exaggerate, or invent the patient's symptoms.

Patient information:

{patient_information}

Your tasks:

1. Create a concise factual summary of what the patient reported.

2. Select the most appropriate hospital department based ONLY
   on the patient's reported complaint and symptoms.

3. Assign a preliminary priority:
   Low, Medium, High, or Emergency.

4. Identify only obvious safety warning signs that are directly
   present in the patient's reported information.

Important:

- Preserve the meaning of the patient's actual complaint.
- Do not turn symptoms into a diagnosis.
- Do not mention diseases as possibilities.
- Do not suggest investigations or tests.
- Do not provide treatment instructions.
- Do not invent information.
- The doctor must be able to review the patient's original
  complaint and symptoms separately from this AI summary.

The summary should be factual and concise.

Patient information:

{patient_information}
"""

    # ========================================================
    # CALL GEMINI
    # ========================================================

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
        # Do not expose provider errors to the patient.
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