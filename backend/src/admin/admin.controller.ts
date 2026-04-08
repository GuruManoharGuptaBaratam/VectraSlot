import { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }


    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this.adminService.getAllUsers();
            res.status(200).json(users);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await this.adminService.getUserById(Number(req.params.id));
            if (!user) return res.status(404).json({ error: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateUserRole(req: Request, res: Response) {
        try {
            const { role } = req.body;
            const user = await this.adminService.updateUserRole(Number(req.params.id), role);
            res.status(200).json({ message: "User role updated", user });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            await this.adminService.deleteUser(Number(req.params.id));
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }



    async createSlot(req: Request, res: Response) {
        try {
            const { slotNumber } = req.body;
            const slot = await this.adminService.createSlot(slotNumber);
            res.status(201).json({ message: "Slot created", slot });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllSlots(req: Request, res: Response) {
        try {
            const slots = await this.adminService.getAllSlots();
            res.status(200).json(slots);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSlot(req: Request, res: Response) {
        try {
            const slot = await this.adminService.updateSlot(Number(req.params.id), req.body);
            res.status(200).json({ message: "Slot updated", slot });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteSlot(req: Request, res: Response) {
        try {
            await this.adminService.deleteSlot(Number(req.params.id));
            res.status(200).json({ message: "Slot deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    async getAllBookings(req: Request, res: Response) {
        try {
            const bookings = await this.adminService.getAllBookings();
            res.status(200).json(bookings);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBookingById(req: Request, res: Response) {
        try {
            const booking = await this.adminService.getBookingById(Number(req.params.id));
            if (!booking) return res.status(404).json({ error: "Booking not found" });
            res.status(200).json(booking);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateBooking(req: Request, res: Response) {
        try {
            const booking = await this.adminService.updateBooking(Number(req.params.id), req.body);
            res.status(200).json({ message: "Booking updated", booking });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteBooking(req: Request, res: Response) {
        try {
            await this.adminService.deleteBooking(Number(req.params.id));
            res.status(200).json({ message: "Booking deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    async getStats(req: Request, res: Response) {
        try {
            const stats = await this.adminService.getStats();
            res.status(200).json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
