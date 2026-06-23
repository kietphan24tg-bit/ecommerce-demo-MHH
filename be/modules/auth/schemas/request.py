from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=9, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_password_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    login_type: Literal["email", "phone"]
    identifier: str
    password: str
    remember_me: bool = False


class OAuthCodeRequest(BaseModel):
    code: str = Field(min_length=1)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(min_length=1)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyTokenRequest(BaseModel):
    token: str = Field(min_length=6, max_length=6)
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    reset_token: str = Field(min_length=1)
    email: EmailStr
    new_password: str = Field(min_length=8, max_length=128)
    confirm_new_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_password_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match")
        return self
