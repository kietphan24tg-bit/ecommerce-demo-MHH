import pytest

from core.config import get_settings
from modules.auth.models.user_provider import UserProvider
from modules.auth.security import hash_password
from modules.users.model import User


@pytest.mark.api
def test_forgot_password_does_not_reveal_missing_email(client, db_session) -> None:
    response = client.post(
        "/api/v1/auth/forgot-password/request",
        json={"email": "missing-user@example.com"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "If the account exists, a reset code has been sent"
    assert "expires_in" in body


@pytest.mark.api
def test_forgot_password_returns_same_message_for_existing_email(
    client,
    db_session,
) -> None:
    db_session.add(
        User(
            full_name="Existing User",
            email="existing-user@example.com",
            phone="0900000001",
            password_hash=hash_password("Password123!"),
        )
    )
    db_session.commit()

    response = client.post(
        "/api/v1/auth/forgot-password/request",
        json={"email": "existing-user@example.com"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "If the account exists, a reset code has been sent"


@pytest.mark.api
def test_login_sets_refresh_cookie_flags_for_development(client, db_session) -> None:
    settings = get_settings()
    db_session.add(
        User(
            full_name="Cookie User",
            email="cookie-user@example.com",
            phone="0900000002",
            password_hash=hash_password("Password123!"),
        )
    )
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "login_type": "email",
            "identifier": "cookie-user@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 200
    cookie_header = response.headers.get("set-cookie", "")
    assert "refresh_token=" in cookie_header
    assert "HttpOnly" in cookie_header
    if settings.resolved_refresh_cookie_secure:
        assert "secure" in cookie_header.lower()
    assert f"samesite={settings.resolved_refresh_cookie_samesite}" in cookie_header.lower()


@pytest.mark.api
def test_google_oauth_creates_user_and_sets_refresh_cookie(
    client,
    db_session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from modules.auth import service

    monkeypatch.setattr(service.settings, "google_client_id", "google-client-id")
    monkeypatch.setattr(
        service.settings,
        "google_client_secret",
        "google-client-secret",
    )
    monkeypatch.setattr(
        service.settings,
        "google_redirect_uri",
        "http://localhost:5173/auth/google/callback",
    )

    class MockResponse:
        def __init__(self, payload: dict) -> None:
            self._payload = payload

        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return self._payload

    def mock_post(url: str, data: dict, timeout: float) -> MockResponse:
        assert data["code"] == "google-code"
        return MockResponse({"access_token": "google-access-token"})

    def mock_get(
        url: str,
        headers: dict | None = None,
        params: dict | None = None,
        timeout: float = 10.0,
    ) -> MockResponse:
        assert headers == {"Authorization": "Bearer google-access-token"}
        return MockResponse(
            {
                "sub": "google-user-123",
                "email": "google-user@example.com",
                "email_verified": True,
                "name": "Google User",
            }
        )

    monkeypatch.setattr(service.httpx, "post", mock_post)
    monkeypatch.setattr(service.httpx, "get", mock_get)

    response = client.post(
        "/api/v1/auth/oauth/google",
        json={"code": "google-code"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "google-user@example.com"
    assert body["user"]["full_name"] == "Google User"
    assert body["user"]["phone"] is None
    assert "access_token" in body

    user = db_session.query(User).filter(User.email == "google-user@example.com").first()
    assert user is not None
    assert user.password_hash is None

    provider = (
        db_session.query(UserProvider)
        .filter(
            UserProvider.provider_name == "google",
            UserProvider.provider_user_id == "google-user-123",
        )
        .first()
    )
    assert provider is not None
    assert provider.user_id == user.id
    assert "refresh_token=" in response.headers.get("set-cookie", "")


@pytest.mark.api
def test_google_oauth_rejects_unverified_email(
    client,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from modules.auth import service

    monkeypatch.setattr(service.settings, "google_client_id", "google-client-id")
    monkeypatch.setattr(
        service.settings,
        "google_client_secret",
        "google-client-secret",
    )
    monkeypatch.setattr(
        service.settings,
        "google_redirect_uri",
        "http://localhost:5173/auth/google/callback",
    )

    class MockResponse:
        def __init__(self, payload: dict) -> None:
            self._payload = payload

        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return self._payload

    def mock_post(url: str, data: dict, timeout: float) -> MockResponse:
        assert data["code"] == "google-code-unverified"
        return MockResponse({"access_token": "google-access-token"})

    def mock_get(
        url: str,
        headers: dict | None = None,
        params: dict | None = None,
        timeout: float = 10.0,
    ) -> MockResponse:
        assert headers == {"Authorization": "Bearer google-access-token"}
        return MockResponse(
            {
                "sub": "google-user-999",
                "email": "unverified@example.com",
                "email_verified": False,
                "name": "Unverified User",
            }
        )

    monkeypatch.setattr(service.httpx, "post", mock_post)
    monkeypatch.setattr(service.httpx, "get", mock_get)

    response = client.post(
        "/api/v1/auth/oauth/google",
        json={"code": "google-code-unverified"},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["message"] == "Google account email is not verified"


@pytest.mark.api
def test_facebook_oauth_links_existing_user_by_email(
    client,
    db_session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from modules.auth import service

    existing_user = User(
        full_name="Existing Facebook User",
        email="facebook-user@example.com",
        phone="0900000003",
        password_hash=hash_password("Password123!"),
    )
    db_session.add(existing_user)
    db_session.commit()

    monkeypatch.setattr(service.settings, "facebook_client_id", "facebook-client-id")
    monkeypatch.setattr(
        service.settings,
        "facebook_client_secret",
        "facebook-client-secret",
    )
    monkeypatch.setattr(
        service.settings,
        "facebook_redirect_uri",
        "http://localhost:5173/auth/facebook/callback",
    )

    class MockResponse:
        def __init__(self, payload: dict) -> None:
            self._payload = payload

        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return self._payload

    def mock_get(
        url: str,
        headers: dict | None = None,
        params: dict | None = None,
        timeout: float = 10.0,
    ) -> MockResponse:
        if url == service.FACEBOOK_TOKEN_URL:
            assert params is not None
            assert params["code"] == "facebook-code"
            return MockResponse({"access_token": "facebook-access-token"})

        assert params == {
            "fields": "id,name,email",
            "access_token": "facebook-access-token",
        }
        return MockResponse(
            {
                "id": "facebook-user-456",
                "email": "facebook-user@example.com",
                "name": "Facebook User",
            }
        )

    monkeypatch.setattr(service.httpx, "get", mock_get)

    response = client.post(
        "/api/v1/auth/oauth/facebook",
        json={"code": "facebook-code"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["id"] == existing_user.id
    assert body["user"]["email"] == "facebook-user@example.com"

    providers = (
        db_session.query(UserProvider)
        .filter(UserProvider.user_id == existing_user.id)
        .all()
    )
    assert len(providers) == 1
    assert providers[0].provider_name == "facebook"
    assert providers[0].provider_user_id == "facebook-user-456"
