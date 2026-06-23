from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.exceptions import NotFoundException
from core.responses import success_response

router = APIRouter(tags=["debug"])


@router.get("/test-success")
def test_success():
    return success_response(
        data={"ok": True},
        message="Operation successful",
    )


@router.get("/test-not-found")
def test_not_found():
    raise NotFoundException(message="User not found")


class LoginBody(BaseModel):
    email: str
    password: str = Field(min_length=8)


@router.post("/test-validation")
def test_validation(body: LoginBody):
    return success_response(data={"email": body.email})


@router.get("/test-500")
def test_500():
    data = None
    return data["x"]
