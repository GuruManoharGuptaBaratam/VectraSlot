import { Request, Response } from "express";
import * as bookingService from "./booking.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createBooking = async (req: AuthRequest, res: Response) => {
    const { slotId, startTime, endTime } = req.body;

    const booking = await bookingService.createBooking(
        req.user.userId,
        slotId,
        new Date(startTime),
        new Date(endTime),
    );

    res.status(201).json(booking);
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
    const bookings = await bookingService.getMyBookings(req.user.userId);
    res.json(bookings);
};

export const getBookingById = async (req: Request, res: Response) => {
    const booking = await bookingService.getBookingById(Number(req.params.id));
    res.json(booking);
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
    const booking = await bookingService.cancelBooking(
        Number(req.params.id),
        req.user.userId,
    );

    res.json(booking);
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
    const { startTime, endTime } = req.body;

    const booking = await bookingService.updateBooking(
        Number(req.params.id),
        req.user.userId,
        new Date(startTime),
        new Date(endTime),
    );

    res.json(booking);
};

export const completeBooking = async (req: AuthRequest, res: Response) => {
    const booking = await bookingService.completeBooking(
        Number(req.params.id),
        req.user.userId,
    );

    res.json(booking);
};
