import { prisma } from "../utils/prisma";

export const getAvailableSlots = async (startTime: Date, endTime: Date) => {
    if (startTime >= endTime) {
        throw new Error("Invalid time range");
    }

    // Step 1: Get all ACTIVE bookings that overlap
    const conflictingBookings = await prisma.booking.findMany({
        where: {
            status: "ACTIVE",
            AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
        select: {
            slotId: true,
        },
    });

    // Step 2: Extract slotIds
    const bookedSlotIds = conflictingBookings.map((b) => b.slotId);

    // Step 3: Get slots NOT in bookedSlotIds
    const availableSlots = await prisma.parkingSlot.findMany({
        where: {
            id: { notIn: bookedSlotIds },
            status: "AVAILABLE",
        },
    });

    return availableSlots;
};
