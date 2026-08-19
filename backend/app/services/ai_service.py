import json

from google import genai

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def analyze_consultation(
    chief_complaint: str,
    symptoms: str,
    medical_history: str | None = None,
    medications: str | None = None,
    allergies: str | None = None,
):
    prompt = f"""
You are an AI hospital patient-assistant system.

Your role is to provide preliminary patient triage support.
You are NOT a doctor and must NOT provide a definitive diagnosis.

Analyze this patient information:

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

Return ONLY valid JSON in exactly this structure:

{{
    "summary": "A short summary of the patient's reported information.",
    "department": "The most appropriate hospital department.",
    "priority": "Low, Medium, High, or Emergency",
    "possible_conditions": [
        "Possible condition 1",
        "Possible condition 2"
    ],
    "recommended_tests": [
        "Potential investigation 1",
        "Potential investigation 2"
    ],
    "red_flags": [
        "Important warning sign 1"
    ]
}}

Rules:

1. Do not provide a definitive diagnosis.
2. Use cautious language such as "possible" or "may be consistent with".
3. If the symptoms could indicate a medical emergency, use "Emergency".
4. Keep the response concise.
5. Return JSON only.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    content = response.text

    if not content:
        raise RuntimeError("Gemini returned an empty response.")

    # Remove markdown code fences if Gemini adds them.
    content = content.strip()

    if content.startswith("```json"):
        content = content[7:]

    if content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    return json.loads(content)