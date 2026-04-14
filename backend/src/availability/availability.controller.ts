import { Request, Response } from "express";
import * as availabilityService from "./availability.service";

export const getAvailableSlots = async (req: Request, res: Response) => {
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
        throw new Error("startTime and endTime required");
    }

    const slots = await availabilityService.getAvailableSlots(
        new Date(startTime as string),
        new Date(endTime as string),
    );

    res.json(slots);
};
