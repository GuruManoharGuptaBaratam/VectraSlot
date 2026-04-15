import { AuthUser } from "../types/auth";

const TOKEN_KEY = "vectraslot_token";
const USER_KEY = "vectraslot_user";
const AUTH_CHANGED_EVENT = "vectraslot-auth-changed";

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChanged();
};

export const subscribeToAuthChanges = (callback: () => void) => {
  const onCustomEvent = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === TOKEN_KEY || event.key === USER_KEY) {
      callback();
    }
  };

  window.addEventListener(AUTH_CHANGED_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
  };
};
