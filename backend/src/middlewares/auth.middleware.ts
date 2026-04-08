import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: Role;
    };
}

export class AuthMiddleware {
    public static verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ error: "Access denied. No token provided." });
            return;
        }

        try {
            const secret = process.env.JWT_SECRET || "default_secret";
            const decoded = jwt.verify(token, secret) as any;
            req.user = decoded;
            next();
        } catch (error) {
            res.status(403).json({ error: "Invalid or expired token." });
        }
    }

    public static authorizeRole(roles: Role[]) {
        return (req: AuthRequest, res: Response, next: NextFunction) => {
            if (!req.user || !roles.includes(req.user.role)) {
                res.status(403).json({ error: "Access denied. Insufficient permissions." });
                return;
            }
            next();
        };
    }
}
