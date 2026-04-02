import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../utils/prisma";
import { AuthRequest, AuthResponse, IAuthStrategy } from "./auth.strategy.interface";
import { Role } from "../../generated/prisma";

export class AdminAuthStrategy implements IAuthStrategy {
    // Admin registration is DISABLED in this application for security.
    async register(data: AuthRequest): Promise<AuthResponse> {
        throw new Error("Admin registration is not allowed through this portal for security reasons.");
    }

    async login(data: AuthRequest): Promise<AuthResponse> {
        const { email, password, adminSecret } = data;

        // EXTRA SECURITY: Admin must provide the correct secret key to even attempt a login
        if (adminSecret !== process.env.ADMIN_SECRET) {
            throw new Error("Login failed: Invalid admin secret key provided.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        
        // SPECIFIC ERROR: Clearly identifies admin-only access and differentiates role mismatch
        if (!user || user.role !== Role.ADMIN) {
            throw new Error("Admin login failed: Account must have Admin privileges or does not exist.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Admin login failed: Incorrect Admin password.");

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1d" }
        );

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role as any },
            token
        };
    }
}
