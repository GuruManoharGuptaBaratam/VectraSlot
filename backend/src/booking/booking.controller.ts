import { Request, Response } from "express";
import * as bookingService from "./booking.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createBookingSchema, updateBookingSchema } from "./booking.validation";

const getAuthUserId = (req: AuthRequest, res: Response): number | null => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user.id;
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthUserId(req, res);
    if (userId === null) return;

    const { slotId, startTime, endTime } = createBookingSchema.parse(req.body);

    const booking = await bookingService.createBooking(
      userId,
      slotId,
      new Date(startTime),
      new Date(endTime),
    );

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  const userId = getAuthUserId(req, res);
  if (userId === null) return;

  const bookings = await bookingService.getMyBookings(userId);
  res.json(bookings);
};

export const getBookingById = async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(Number(req.params.id));
  res.json(booking);
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const userId = getAuthUserId(req, res);
  if (userId === null) return;

  const booking = await bookingService.cancelBooking(
    Number(req.params.id),
    userId,
  );

  res.json(booking);
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthUserId(req, res);
    if (userId === null) return;

    const { startTime, endTime } = updateBookingSchema.parse(req.body);

    const booking = await bookingService.updateBooking(
      Number(req.params.id),
      userId,
      new Date(startTime),
      new Date(endTime),
    );

    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const completeBooking = async (req: AuthRequest, res: Response) => {
  const userId = getAuthUserId(req, res);
  if (userId === null) return;

  const booking = await bookingService.completeBooking(
    Number(req.params.id),
    userId,
  );

  res.json(booking);
};
