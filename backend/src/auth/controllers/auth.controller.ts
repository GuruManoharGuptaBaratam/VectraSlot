import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserAuthStrategy } from "../strategies/user.strategy";
import { AdminAuthStrategy } from "../strategies/admin.strategy";
import { IAuthStrategy } from "../strategies/auth.strategy.interface";

export class AuthController {
    private authService: AuthService;

    constructor() {
        // Default strategy
        this.authService = new AuthService(new UserAuthStrategy());
    }

    private resolveStrategy(role?: string): IAuthStrategy {
        if (role?.toUpperCase() === 'ADMIN') {
            return new AdminAuthStrategy();
        }
        return new UserAuthStrategy();
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            // REGISTRATION IS NOW FOR USER ONLY
            this.authService.setStrategy(new UserAuthStrategy());
            
            const result = await this.authService.register(data);
            res.status(201).json({
                message: "User registration successful",
                data: result
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { role, ...data } = req.body;
            // LOGIN STILL REQUIRES ROLE TO KNOW WHICH STRATEGY TO USE
            if (!role) throw new Error("Role (USER or ADMIN) is required for login.");
            
            this.authService.setStrategy(this.resolveStrategy(role));

            const result = await this.authService.login(data);
            res.status(200).json({
                message: "Login successful",
                data: result
            });
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
}
