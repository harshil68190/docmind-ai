import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

/**
 * Single Axios instance for the whole app. Every `*.api.ts` module imports
 * this instead of calling `axios` directly, so base URL, auth headers, and
 * 401-triggered token refresh are all handled in exactly one place.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// A bare axios instance (no interceptors) used only for the refresh call
// itself — refreshing through `apiClient` would recursively trigger this
// same interceptor if the refresh call also 401s.
const refreshClient = axios.create({ baseURL: apiClient.defaults.baseURL });

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function resolvePendingRequests(token: string | null) {
  pendingRequests.forEach((resolve) => resolve(token));
  pendingRequests = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const { refreshToken, setAccessToken, clearSession } = useAuthStore.getState();

    if (!refreshToken) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // A refresh is already in flight (e.g. two requests 401'd at once) —
      // queue this request instead of firing a second refresh call.
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await refreshClient.post("/auth/refresh", { refresh_token: refreshToken });
      setAccessToken(data.access_token);
      resolvePendingRequests(data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(null);
      clearSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function redirectToLogin() {
  // A hard navigation rather than `useNavigate()` because this interceptor
  // runs outside the React tree and has no router context to call into.
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}
