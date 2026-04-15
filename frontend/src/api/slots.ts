import { requestJson, unwrapData } from "./http";

export type SlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED";

export interface SlotRecord {
  id: number;
  slotNumber: string;
  status: SlotStatus;
  createdAt: string;
}

type SlotResponse = {
  success?: boolean;
  message?: string;
  data: SlotRecord[];
};

export const getPublicSlots = async (): Promise<SlotRecord[]> => {
  const response = await requestJson<SlotResponse>("/api/slots");
  return unwrapData(response);
};

export const getAvailableSlots = async (
  startTime: string,
  endTime: string,
): Promise<SlotRecord[]> => {
  const query = new URLSearchParams({ startTime, endTime }).toString();
  return requestJson<SlotRecord[]>(`/api/slots/available?${query}`);
};
