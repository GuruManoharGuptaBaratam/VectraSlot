import { prisma } from "../utils/prisma";
import { Role } from "@prisma/client";

export class AdminService {
  // --- USER MANAGEMENT ---
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        bookings: true,
      },
    });
  }

  async updateUserRole(id: number, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }

  // --- SLOT MANAGEMENT ---
  async createSlot(slotNumber: string) {
    const normalizedSlotNumber = slotNumber.trim();

    if (!normalizedSlotNumber) {
      throw new Error("Slot number is required");
    }

    const existingSlot = await prisma.parkingSlot.findFirst({
      where: {
        slotNumber: {
          equals: normalizedSlotNumber,
          mode: "insensitive",
        },
      },
    });

    if (existingSlot) {
      throw new Error(
        `Slot with number ${normalizedSlotNumber} already exists`,
      );
    }

    return prisma.parkingSlot.create({
      data: { slotNumber: normalizedSlotNumber },
    });
  }

  async getAllSlots() {
    return prisma.parkingSlot.findMany({
      include: { bookings: { where: { status: "ACTIVE" } } },
    });
  }

  async updateSlot(id: number, data: any) {
    return prisma.parkingSlot.update({
      where: { id },
      data,
    });
  }

  async deleteSlot(id: number) {
    return prisma.parkingSlot.delete({
      where: { id },
    });
  }

  // --- BOOKING MANAGEMENT ---
  async getAllBookings() {
    return prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        slot: { select: { slotNumber: true } },
      },
    });
  }

  async getBookingById(id: number) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        slot: { select: { slotNumber: true } },
      },
    });
  }

  async updateBooking(id: number, data: any) {
    return prisma.booking.update({
      where: { id },
      data,
    });
  }

  async deleteBooking(id: number) {
    return prisma.booking.delete({
      where: { id },
    });
  }

  // --- DASHBOARD / STATS ---
  async getStats() {
    const [userCount, bookingCount, slotCount, activeBookings] =
      await Promise.all([
        prisma.user.count(),
        prisma.booking.count(),
        prisma.parkingSlot.count(),
        prisma.booking.count({ where: { status: "ACTIVE" } }),
      ]);

    const availableSlots = await prisma.parkingSlot.count({
      where: { status: "AVAILABLE" },
    });

    return {
      totalUsers: userCount,
      totalBookings: bookingCount,
      totalSlots: slotCount,
      activeBookings,
      availableSlots,
    };
  }
}
