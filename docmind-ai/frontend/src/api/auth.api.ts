import { apiClient } from "@/api/client";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  TokenResponseDto,
  UserResponseDto,
} from "@/types/auth";

function toAuthUser(dto: UserResponseDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.full_name,
    isActive: dto.is_active,
    isVerified: dto.is_verified,
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<UserResponseDto>("/auth/register", {
    email: payload.email,
    full_name: payload.fullName,
    password: payload.password,
  });
  return toAuthUser(data);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<UserResponseDto>("/auth/me");
  return toAuthUser(data);
}

/**
 * `/auth/login` only returns tokens, not the user profile — so a login
 * fetches `/auth/me` immediately afterward using the freshly issued token.
 * This keeps the backend contract simple (login = tokens, `/me` = profile)
 * at the cost of one extra round trip, which is the right tradeoff at this
 * scale.
 */
export async function loginUser(
  payload: LoginPayload
): Promise<{ user: AuthUser; tokens: TokenResponseDto }> {
  const { data: tokens } = await apiClient.post<TokenResponseDto>("/auth/login", payload);
  const { data: meDto } = await apiClient.get<UserResponseDto>("/auth/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  return { user: toAuthUser(meDto), tokens };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponseDto> {
  const { data } = await apiClient.post<TokenResponseDto>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/auth/logout");
}
