import { extractErrorMessage, requestJson } from "./http";
import {
  ApiSuccessResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

async function postJson<TPayload>(
  endpoint: string,
  payload: TPayload,
): Promise<ApiSuccessResponse> {
  try {
    return await requestJson<ApiSuccessResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : extractErrorMessage(error);

    throw new Error(message || "Request failed");
  }
}

export function registerUser(
  payload: RegisterPayload,
): Promise<ApiSuccessResponse> {
  return postJson("/api/auth/register", payload);
}

export function loginUser(payload: LoginPayload): Promise<ApiSuccessResponse> {
  return postJson("/api/auth/login", payload);
}
