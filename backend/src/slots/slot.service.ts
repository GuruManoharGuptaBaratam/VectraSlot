import { prisma } from "../utils/prisma";
import { SlotStatus } from "../generated/prisma";

export class SlotService {
  async createSlot(slotNumber: string) {
    if (!slotNumber) {
      throw new Error("slotNumber is required");
    }
    
    // Check if slot already exists
    const existingSlot = await prisma.parkingSlot.findUnique({
      where: { slotNumber }
    });

    if (existingSlot) {
      throw new Error(`Slot with number ${slotNumber} already exists`);
    }

    const slot = await prisma.parkingSlot.create({
      data: {
        slotNumber,
        status: SlotStatus.AVAILABLE,
      }
    });

    return slot;
  }

  async getAllSlots() {
    return prisma.parkingSlot.findMany({
      orderBy: { slotNumber: 'asc' }
    });
  }

  async updateSlot(id: number, data: { status?: SlotStatus; slotNumber?: string }) {
    const existingSlot = await prisma.parkingSlot.findUnique({ where: { id } });
    if (!existingSlot) {
      throw new Error("Slot not found");
    }

    if (data.slotNumber && data.slotNumber !== existingSlot.slotNumber) {
      const clash = await prisma.parkingSlot.findUnique({ where: { slotNumber: data.slotNumber } });
      if (clash) {
         throw new Error(`Slot with number ${data.slotNumber} already exists`);
      }
    }

    const updatedSlot = await prisma.parkingSlot.update({
      where: { id },
      data,
    });

    return updatedSlot;
  }
}
