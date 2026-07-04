import hashlib
import hmac
import os


def verify_service_token(token: str) -> bool:
    expected = os.getenv("AI_SERVICE_TOKEN", "dev-token")
    return hmac.compare_digest(token, expected)
