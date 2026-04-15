export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const extractErrorMessage = (payload: unknown): string => {
  if (payload && typeof payload === "object") {
    const record = payload as { error?: unknown; message?: unknown };

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return "Request failed";
};

export async function requestJson<T>(
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload));
  }

  return payload as T;
}

export function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as ApiEnvelope<T>;

    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }

  return payload as T;
}
