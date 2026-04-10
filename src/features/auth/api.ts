import { apiGet, apiRequest } from "@shared/lib/http";
import type { AuthUser } from "@features/auth/store";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  login: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  role: string;
};

export type UpdateAccountPayload = {
  email: string;
  username: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload
  });
}

export function logout(refreshToken: string) {
  return apiRequest<void>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken }
  });
}

export function me() {
  return apiGet<AuthUser>("/api/auth/me");
}

export function getAccount() {
  return apiGet<AuthUser>("/api/account");
}

export function updateAccount(payload: UpdateAccountPayload) {
  return apiRequest<AuthUser>("/api/account", {
    method: "PATCH",
    body: payload
  });
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiRequest<void>("/api/account/password", {
    method: "PATCH",
    body: payload
  });
}
