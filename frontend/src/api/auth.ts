import {
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function postJson<TPayload>(
  endpoint: string,
  payload: TPayload,
): Promise<ApiSuccessResponse> {
  const response = await fetch(`${apiBase}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiSuccessResponse | ApiErrorResponse;

  if (!response.ok) {
    const message = "error" in body ? body.error : "Request failed";
    throw new Error(message);
  }

  return body as ApiSuccessResponse;
}

export function registerUser(
  payload: RegisterPayload,
): Promise<ApiSuccessResponse> {
  return postJson("/api/auth/register", payload);
}

export function loginUser(payload: LoginPayload): Promise<ApiSuccessResponse> {
  return postJson("/api/auth/login", payload);
}
