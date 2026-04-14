import { z } from "zod";

export const availabilityQuerySchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
});
