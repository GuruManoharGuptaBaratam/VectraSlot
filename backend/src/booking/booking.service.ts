import { prisma } from "../utils/prisma";

export const createBooking = async (
    userId: number,
    slotId: number,
    startTime: Date,
    endTime: Date,
) => {
    return await prisma.$transaction(async (tx) => {
        const conflict = await tx.booking.findFirst({
            where: {
                slotId,
                status: "ACTIVE",
                AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
            },
        });

        if (conflict) {
            throw new Error("Slot already booked for this time range");
        }

        const booking = await tx.booking.create({
            data: {
                userId,
                slotId,
                startTime,
                endTime,
            },
        });

        return booking;
    });
};

export const getMyBookings = async (userId: number) => {
    return prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};

export const getBookingById = async (id: number) => {
    return prisma.booking.findUnique({
        where: { id },
    });
};

export const cancelBooking = async (id: number, userId: number) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.userId !== userId) {
        throw new Error("Unauthorized");
    }

    return prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
    });
};

export const updateBooking = async (
    id: number,
    userId: number,
    startTime: Date,
    endTime: Date,
) => {
    return prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
            where: { id },
        });

        if (!booking) throw new Error("Booking not found");

        if (booking.userId !== userId) {
            throw new Error("Unauthorized");
        }

        if (booking.status !== "ACTIVE") {
            throw new Error("Only active bookings can be updated");
        }

        if (startTime >= endTime) {
            throw new Error("Invalid time range");
        }

        const conflict = await tx.booking.findFirst({
            where: {
                slotId: booking.slotId,
                status: "ACTIVE",
                id: { not: id },
                AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
            },
        });

        if (conflict) {
            throw new Error("Slot already booked for this time range");
        }

        return tx.booking.update({
            where: { id },
            data: {
                startTime,
                endTime,
            },
        });
    });
};

export const completeBooking = async (id: number, userId: number) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.userId !== userId) {
        throw new Error("Unauthorized");
    }

    if (booking.status !== "ACTIVE") {
        throw new Error("Booking is not active");
    }

    return prisma.booking.update({
        where: { id },
        data: {
            status: "COMPLETED",
            endTime: new Date(),
        },
    });
};
