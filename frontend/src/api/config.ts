const configuredApiBase = import.meta.env.VITE_API_BASE_URL ?? "";

export const API_BASE_URL =
  configuredApiBase.replace(/\/$/, "") || "https://vectraslot-v1.onrender.com";
