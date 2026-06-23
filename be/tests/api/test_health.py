import pytest


@pytest.mark.api
def test_health_returns_ok(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.api
def test_ready_returns_ok_when_dependencies_are_available(client) -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["checks"]["database"]["status"] == "ok"
    assert body["checks"]["redis"]["status"] == "ok"


@pytest.mark.api
def test_ready_returns_503_when_database_is_unavailable(client, monkeypatch) -> None:
    monkeypatch.setattr(
        "core.health._check_database",
        lambda: ("error", "database unavailable"),
    )

    response = client.get("/ready")
    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "degraded"
    assert body["checks"]["database"]["status"] == "error"


@pytest.mark.api
def test_ready_returns_503_when_redis_is_unavailable(client, monkeypatch) -> None:
    monkeypatch.setattr(
        "core.health._check_redis",
        lambda: ("error", "redis unavailable"),
    )

    response = client.get("/ready")
    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "degraded"
    assert body["checks"]["redis"]["status"] == "error"
