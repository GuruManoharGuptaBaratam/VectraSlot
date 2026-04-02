import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../utils/prisma";
import { AuthRequest, AuthResponse, IAuthStrategy } from "./auth.strategy.interface";
import { Role } from "../../generated/prisma";

export class UserAuthStrategy implements IAuthStrategy {
    async register(data: AuthRequest): Promise<AuthResponse> {
        const { name, email, password } = data;
        
        if (!name) throw new Error("Name is required");

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.USER // STRICTLY set to USER on registration
            }
        });

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

    async login(data: AuthRequest): Promise<AuthResponse> {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });
        
        // SPECIFIC ERROR: Differentiates between missing records or incorrect role access
        if (!user || user.role !== Role.USER) {
            throw new Error("Login failed: Invalid User account or incorrect role.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Login failed: Incorrect User password.");

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
