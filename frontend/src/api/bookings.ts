import { requestJson } from "./http";

export type BookingStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface BookingRecord {
  id: number;
  userId: number;
  slotId: number;
  startTime: string;
  endTime: string | null;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingPayload {
  slotId: number;
  startTime: string;
  endTime: string;
}

export interface UpdateBookingPayload {
  startTime: string;
  endTime: string;
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getMyBookings = async (
  token: string,
): Promise<BookingRecord[]> => {
  return requestJson<BookingRecord[]>("/api/booking/my", {
    headers: authHeaders(token),
  });
};

export const createBooking = async (
  token: string,
  payload: CreateBookingPayload,
): Promise<BookingRecord> => {
  return requestJson<BookingRecord>("/api/booking", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const updateBooking = async (
  token: string,
  bookingId: number,
  payload: UpdateBookingPayload,
): Promise<BookingRecord> => {
  return requestJson<BookingRecord>(`/api/booking/${bookingId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const cancelBooking = async (
  token: string,
  bookingId: number,
): Promise<BookingRecord> => {
  return requestJson<BookingRecord>(`/api/booking/${bookingId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
};

export const completeBooking = async (
  token: string,
  bookingId: number,
): Promise<BookingRecord> => {
  return requestJson<BookingRecord>(`/api/booking/${bookingId}/complete`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
};
