import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

export const createSlotSchema = z.object({
  slotNumber: z
    .string()
    .trim()
    .min(1, "Slot number is required")
    .max(20, "Slot number must be 20 characters or fewer"),
});
