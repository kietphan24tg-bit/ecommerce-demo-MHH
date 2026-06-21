from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    role: str

    model_config = {"from_attributes": True}


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class MessageResponse(BaseModel):
    message: str


class RequestPasswordResetResponse(BaseModel):
    message: str
    expires_in: int


class VerifyPasswordResetResponse(BaseModel):
    message: str
    reset_token: str
