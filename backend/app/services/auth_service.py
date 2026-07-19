"""
Authentication service.

Owns every business rule around registration, login, and token lifecycle.
The API layer (`endpoints/auth.py`) never touches `UserRepository` or the
security helpers directly — it only calls this service, which is what
keeps `services/` the one place business logic can be unit tested with a
mocked repository and no real database or HTTP layer involved.
"""
import uuid

from app.core.config import settings
from app.core.exceptions import AlreadyExistsException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import TokenResponse, UserCreate


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    def register(self, payload: UserCreate) -> User:
        if self.user_repository.get_by_email(payload.email) is not None:
            raise AlreadyExistsException(
                f"An account with email '{payload.email}' already exists"
            )
        hashed_password = hash_password(payload.password)
        return self.user_repository.create(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hashed_password,
        )

    def authenticate(self, email: str, password: str) -> User:
        user = self.user_repository.get_by_email(email)
        # Deliberately identical error for "no such user" and "wrong
        # password" — distinguishing them lets an attacker enumerate valid
        # emails against the login endpoint.
        if user is None or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException("This account has been deactivated")
        return self.user_repository.mark_login(user)

    def issue_tokens(self, user: User) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Provided token is not a refresh token")

        user = self._get_user_from_subject(payload.get("sub"))
        # Issuing a fresh refresh token too ("rotation") is deliberately not
        # done here — see the `/auth/logout` endpoint's docstring for how
        # rotation and revocation are designed to work together later.
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def get_user_from_access_token(self, token: str) -> User:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise UnauthorizedException("Provided token is not an access token")
        return self._get_user_from_subject(payload.get("sub"))

    def _get_user_from_subject(self, subject: str | None) -> User:
        if subject is None:
            raise UnauthorizedException("Token is missing a subject claim")
        try:
            user_id = uuid.UUID(subject)
        except ValueError as exc:
            raise UnauthorizedException("Token subject is not a valid user id") from exc

        user = self.user_repository.get_by_id(user_id)
        if user is None:
            raise UnauthorizedException("User associated with this token no longer exists")
        return user
