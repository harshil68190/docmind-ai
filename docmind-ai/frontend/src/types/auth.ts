/**
 * Client-side shape of an authenticated user. Field names are camelCase
 * here even though the API returns snake_case — the mapping happens once,
 * in `api/auth.api.ts`, so nothing else in the app has to think about
 * casing.
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
}

/** Raw shape returned by GET /auth/register and GET /auth/me. */
export interface UserResponseDto {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

/** Raw shape returned by POST /auth/login and POST /auth/refresh. */
export interface TokenResponseDto {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterPayload {
  email: string;
  fullName: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
