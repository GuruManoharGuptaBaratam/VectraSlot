export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthData {
  user: AuthUser;
  token: string;
}

export interface ApiSuccessResponse {
  message: string;
  data: AuthData;
}

export interface ApiErrorResponse {
  error: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
  adminSecret?: string;
}
