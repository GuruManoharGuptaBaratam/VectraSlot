import { Router } from "express";
import { getAvailableSlots } from "./availability.controller";

const router = Router();

router.get("/available", getAvailableSlots);

export default router;
