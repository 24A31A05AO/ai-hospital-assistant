import os

from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse

router = APIRouter(
    prefix="/whatsapp",
    tags=["WhatsApp"],
)


@router.get("/webhook", response_class=PlainTextResponse)
async def verify_whatsapp_webhook(request: Request):
    params = request.query_params

    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    expected_token = os.getenv("WHATSAPP_VERIFY_TOKEN")

    if (
        mode == "subscribe"
        and token
        and expected_token
        and token == expected_token
    ):
        return challenge or ""

    return PlainTextResponse(
        "Verification failed",
        status_code=403,
    )


@router.post("/webhook")
async def receive_whatsapp_message(request: Request):
    body = await request.json()

    print("WhatsApp webhook received:")
    print(body)

    return {"status": "received"}