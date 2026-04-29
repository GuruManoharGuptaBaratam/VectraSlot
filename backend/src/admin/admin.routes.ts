import { Router } from "express";
import { AdminController } from "./admin.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();
const controller = new AdminController();


router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.authorizeRole([Role.ADMIN]));


router.get("/users", (req, res) => controller.getAllUsers(req, res));
router.get("/users/:id", (req, res) => controller.getUserById(req, res));
router.patch("/users/:id/role", (req, res) => controller.updateUserRole(req, res));
router.delete("/users/:id", (req, res) => controller.deleteUser(req, res));

router.post("/slots", (req, res) => controller.createSlot(req, res));
router.get("/slots", (req, res) => controller.getAllSlots(req, res));
router.patch("/slots/:id", (req, res) => controller.updateSlot(req, res));
router.delete("/slots/:id", (req, res) => controller.deleteSlot(req, res));


router.get("/bookings", (req, res) => controller.getAllBookings(req, res));
router.get("/bookings/:id", (req, res) => controller.getBookingById(req, res));
router.patch("/bookings/:id", (req, res) => controller.updateBooking(req, res));
router.delete("/bookings/:id", (req, res) => controller.deleteBooking(req, res));


router.get("/stats", (req, res) => controller.getStats(req, res));

export default router;
