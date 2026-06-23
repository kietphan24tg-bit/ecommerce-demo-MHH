import pytest


@pytest.mark.integration
def test_integration_services_placeholder() -> None:
    pytest.skip(
        "Integration tests run in a separate job with Postgres and Redis service containers",
    )
