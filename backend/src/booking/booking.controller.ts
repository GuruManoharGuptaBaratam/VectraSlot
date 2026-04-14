import { Request, Response } from "express";
import * as bookingService from "./booking.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createBookingSchema, updateBookingSchema } from "./booking.validation";

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const parsed = createBookingSchema.parse(req.body);
        const { slotId, startTime, endTime } = parsed;

        if (!slotId || !startTime || !endTime) {
            return res
                .status(400)
                .json({ error: "Missing required fields: slotId, startTime, endTime" });
        }

        const booking = await bookingService.createBooking(
            req.user.id,
            Number(slotId),
            new Date(startTime),
            new Date(endTime),
        );

        res.status(201).json(booking);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const bookings = await bookingService.getMyBookings(req.user.id);
    res.json(bookings);
};

export const getBookingById = async (req: Request, res: Response) => {
    const booking = await bookingService.getBookingById(Number(req.params.id));
    res.json(booking);
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const booking = await bookingService.cancelBooking(
        Number(req.params.id),
        req.user.id,
    );

    res.json(booking);
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { startTime, endTime } = updateBookingSchema.parse(req.body);

    const booking = await bookingService.updateBooking(
        Number(req.params.id),
        req.user.id,
        new Date(startTime),
        new Date(endTime),
    );

    res.json(booking);
};

export const completeBooking = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const booking = await bookingService.completeBooking(
        Number(req.params.id),
        req.user.id,
    );

    res.json(booking);
};
