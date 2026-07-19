"""
Auth request/response schemas.

`UserResponse` deliberately has no `hashed_password` field — Pydantic's
`from_attributes` mode reads only the fields declared here off the ORM
object, so there is no path by which a hash can end up in an API response
even if a service accidentally passes the full `User` model back.
"""
import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_UPPERCASE_RE = re.compile(r"[A-Z]")
_LOWERCASE_RE = re.compile(r"[a-z]")
_DIGIT_RE = re.compile(r"\d")


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not _UPPERCASE_RE.search(value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not _LOWERCASE_RE.search(value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not _DIGIT_RE.search(value):
            raise ValueError("Password must contain at least one digit")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until the access token expires


class RefreshTokenRequest(BaseModel):
    refresh_token: str
