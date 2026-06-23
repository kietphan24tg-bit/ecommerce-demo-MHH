import pytest

from core.config import get_settings


@pytest.mark.api
def test_rate_limit_returns_429_with_retry_after(client, monkeypatch) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "rate_limit_global_requests", 1)
    monkeypatch.setattr(settings, "rate_limit_global_window_seconds", 60)

    first = client.get("/health")
    assert first.status_code == 200

    second = client.get("/health")
    assert second.status_code == 429
    assert second.headers.get("Retry-After") is not None
    assert int(second.headers["Retry-After"]) >= 1

    body = second.json()
    assert body["success"] is False
    assert body["error"]["code"] == "TOO_MANY_REQUESTS"
