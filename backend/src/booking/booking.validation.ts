import { z } from "zod";

export const createBookingSchema = z.object({
    slotId: z.number(),
    startTime: z.string(),
    endTime: z.string(),
});

export const updateBookingSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
});
