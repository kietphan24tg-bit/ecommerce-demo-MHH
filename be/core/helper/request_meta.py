from fastapi import Request

from core.config import get_settings


def get_client_ip(request: Request) -> str:
    settings = get_settings()
    if settings.trusted_proxy:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

    if request.client and request.client.host:
        return request.client.host

    return "unknown"
