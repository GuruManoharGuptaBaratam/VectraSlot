import { Router } from "express";
import { SlotController } from "./slot.controller";

const router = Router();
const controller = new SlotController();

// GET all slots (public/all)
router.get("/", (req, res) => controller.getAllSlots(req, res));

// POST create slot (admin requirement to be enforced by middleware later)
router.post("/", (req, res) => controller.createSlot(req, res));

// PATCH update slot (admin requirement to be enforced by middleware later)
router.patch("/:id", (req, res) => controller.updateSlot(req, res));

export default router;
