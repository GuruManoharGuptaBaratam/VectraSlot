import { Router } from "express";
import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    updateBooking,
    completeBooking,
} from "./booking.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createBooking);

// Get my bookings
router.get("/my", getMyBookings);

// Get booking by ID
router.get("/:id", getBookingById);

// Cancel booking
router.delete("/:id", cancelBooking);

// Update booking (change time)
router.patch("/:id", updateBooking);

// Mark booking as complete
router.patch("/:id/complete", completeBooking);

export default router;
