"""
Authentication endpoints.

Every handler here is a thin adapter: parse request -> call one AuthService
method -> return response. No business logic lives in this module — if
you're tempted to add an `if` statement checking a business rule here,
it belongs in `AuthService` instead.
"""
from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_auth_service, get_current_active_user
from app.models.user import User
from app.schemas.auth_schema import (
    RefreshTokenRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    return auth_service.register(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Exchange email/password for an access + refresh token pair",
)
def login(
    payload: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    user = auth_service.authenticate(payload.email, payload.password)
    return auth_service.issue_tokens(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access token",
)
def refresh(
    payload: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return auth_service.refresh_access_token(payload.refresh_token)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Log out the current session",
)
def logout(current_user: User = Depends(get_current_active_user)) -> dict:
    """
    Placeholder implementation — see below for why, and what's needed to
    make it a real server-side invalidation.

    JWTs are stateless by design: once issued, an access token remains
    cryptographically valid until it expires, regardless of anything the
    server does afterward. This endpoint exists as a real API contract for
    the frontend to call (it clears the client-side session), but it does
    NOT invalidate the token server-side yet.

    To make logout actually revoke a token, one of these is needed:
    1. **Token blacklist** — store each token's `jti` claim (already present
       on every token issued by `core/security.py`) in a fast lookup store
       (Redis, or a Postgres table with a TTL-based cleanup job) and check
       membership in `get_current_user` on every request. Simple, but adds
       a lookup to every authenticated request.
    2. **Refresh token rotation** — persist issued refresh tokens (or just
       their `jti`) in the DB, mark them "used" on each `/auth/refresh`
       call, and reject reuse. This revokes long-lived sessions without
       penalizing every single request, at the cost of only being able to
       force-expire a session once its short-lived access token naturally
       expires.
    Both are legitimate, well-known patterns — deferred here because they
    require new infrastructure (Redis, or a `token_blacklist`/
    `refresh_tokens` table) that's out of scope for Milestone 2.
    """
    return {
        "detail": (
            f"Logged out. {current_user.email}'s access token remains valid "
            "until it naturally expires — see this endpoint's docstring for "
            "how server-side revocation would be added."
        )
    }
