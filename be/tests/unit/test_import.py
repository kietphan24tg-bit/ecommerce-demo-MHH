import pytest


@pytest.mark.unit
def test_main_app_imports() -> None:
    from main import app

    assert app.title
    assert app.openapi_url is not None
