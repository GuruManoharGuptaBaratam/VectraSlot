import { Request, Response } from "express";
import { SlotService } from "./slot.service";

export class SlotController {
  constructor(private slotService: SlotService) {}

  async createSlot(req: Request, res: Response) {
    try {
      const { slotNumber } = req.body;
      const slot = await this.slotService.createSlot(slotNumber);
      return res.status(201).json({ success: true, data: slot });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Failed to create slot" });
    }
  }

  async getAllSlots(req: Request, res: Response) {
    try {
      const slots = await this.slotService.getAllSlots();
      return res.status(200).json({ success: true, data: slots });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to fetch slots" });
    }
  }

  async updateSlot(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, slotNumber } = req.body;
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ success: false, message: "Invalid slot ID format" });
      }

      const updatedSlot = await this.slotService.updateSlot(parsedId, { status, slotNumber });
      return res.status(200).json({ success: true, data: updatedSlot });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Failed to update slot" });
    }
  }
}
