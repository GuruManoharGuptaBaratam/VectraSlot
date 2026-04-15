import { extractErrorMessage, requestJson } from "./http";

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalSlots: number;
  activeBookings: number;
  availableSlots: number;
}

export type AdminUserRole = "USER" | "ADMIN";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  createdAt: string;
}

export type SlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED";

export interface AdminSlot {
  id: number;
  slotNumber: string;
  status: SlotStatus;
  createdAt: string;
  bookings?: Array<{ id: number; status: string }>;
}

export interface AdminBooking {
  id: number;
  startTime: string;
  endTime: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  slot: {
    slotNumber: string;
  };
}

export type BookingStatus = AdminBooking["status"];

async function requestWithAuth<T>(
  endpoint: string,
  token: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  try {
    return await requestJson<T>(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : extractErrorMessage(error);

    throw new Error(message || "Failed to process admin request");
  }
}

async function getJson<T>(endpoint: string, token: string): Promise<T> {
  return requestWithAuth<T>(endpoint, token, "GET");
}

export const getAdminStats = (token: string) => {
  return getJson<AdminStats>("/api/admin/stats", token);
};

export const getAdminUsers = (token: string) => {
  return getJson<AdminUser[]>("/api/admin/users", token);
};

export const getAdminSlots = (token: string) => {
  return getJson<AdminSlot[]>("/api/admin/slots", token);
};

export const getAdminBookings = (token: string) => {
  return getJson<AdminBooking[]>("/api/admin/bookings", token);
};

export const updateAdminUserRole = (
  token: string,
  userId: number,
  role: AdminUserRole,
) => {
  return requestWithAuth<{ message: string; user: AdminUser }>(
    `/api/admin/users/${userId}/role`,
    token,
    "PATCH",
    {
      role,
    },
  );
};

export const deleteAdminUser = (token: string, userId: number) => {
  return requestWithAuth<{ message: string }>(
    `/api/admin/users/${userId}`,
    token,
    "DELETE",
  );
};

export const createAdminSlot = (token: string, slotNumber: string) => {
  return requestWithAuth<{ message: string; slot: AdminSlot }>(
    "/api/admin/slots",
    token,
    "POST",
    {
      slotNumber,
    },
  );
};

export const updateAdminSlot = (
  token: string,
  slotId: number,
  data: Partial<Pick<AdminSlot, "slotNumber" | "status">>,
) => {
  return requestWithAuth<{ message: string; slot: AdminSlot }>(
    `/api/admin/slots/${slotId}`,
    token,
    "PATCH",
    data,
  );
};

export const deleteAdminSlot = (token: string, slotId: number) => {
  return requestWithAuth<{ message: string }>(
    `/api/admin/slots/${slotId}`,
    token,
    "DELETE",
  );
};

export const updateAdminBooking = (
  token: string,
  bookingId: number,
  data: Partial<{
    startTime: string;
    endTime: string | null;
    status: BookingStatus;
  }>,
) => {
  return requestWithAuth<{ message: string; booking: AdminBooking }>(
    `/api/admin/bookings/${bookingId}`,
    token,
    "PATCH",
    data,
  );
};

export const deleteAdminBooking = (token: string, bookingId: number) => {
  return requestWithAuth<{ message: string }>(
    `/api/admin/bookings/${bookingId}`,
    token,
    "DELETE",
  );
};
