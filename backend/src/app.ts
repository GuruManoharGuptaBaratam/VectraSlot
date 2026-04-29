import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import authRoutes from "./auth/auth.routes";
import adminRoutes from "./admin/admin.routes";
import slotRoutes from "./slots/slot.routes";
import bookingRoutes from "./booking/booking.routes";
import availabilityRoutes from "./availability/availability.routes";

dotenv.config();

class App {
    public app: express.Application;
    private port: string | number;
    private allowedOrigins: string[];
    private allowedOriginPatterns: RegExp[];
    private readonly defaultAllowedOriginPatterns: RegExp[];

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4035;
        this.allowedOrigins = this.getAllowedOrigins();
        this.defaultAllowedOriginPatterns = [
            /^https:\/\/vectra-slot-frontend(-.*)?\.vercel\.app$/,
        ];
        this.allowedOriginPatterns = this.getAllowedOriginPatterns();

        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private getAllowedOrigins(): string[] {
        const configuredOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "";

        return configuredOrigins
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean);
    }

    private getAllowedOriginPatterns(): RegExp[] {
        const configuredPatterns = process.env.CORS_ORIGIN_REGEX || "";

        return configuredPatterns
            .split(",")
            .map((pattern) => pattern.trim())
            .filter(Boolean)
            .flatMap((pattern) => {
                try {
                    return [new RegExp(pattern)];
                } catch {
                    console.warn(`Skipping invalid CORS regex pattern: ${pattern}`);
                    return [];
                }
            });
    }

    private isOriginAllowed(origin: string): boolean {
        if (this.allowedOrigins.includes(origin)) {
            return true;
        }

        return [...this.defaultAllowedOriginPatterns, ...this.allowedOriginPatterns].some((pattern) =>
            pattern.test(origin)
        );
    }

    private initializeMiddlewares() {
        const corsOptions: cors.CorsOptions = {
            origin: (origin, callback) => {
                const hasCorsRestrictions =
                    this.allowedOrigins.length > 0 ||
                    this.allowedOriginPatterns.length > 0 ||
                    this.defaultAllowedOriginPatterns.length > 0;

                if (!origin || !hasCorsRestrictions || this.isOriginAllowed(origin)) {
                    callback(null, true);
                    return;
                }

                callback(null, false);
            },
            methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            optionsSuccessStatus: 204,
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes() {
        this.app.get("/health-check", (req, res) => {
            res.status(200).json({ status: "OK", message: "Server is healthy" });
        });

        // Use authentication routes
        this.app.use("/api/auth", authRoutes);
        
        // Use Admin routes
        this.app.use("/api/admin", adminRoutes);
        
        // Use slot routes
        this.app.use("/api/slots", slotRoutes);

        // Use booking routes
        this.app.use("/api/booking", bookingRoutes);

        // Use availability routes (mounted on /api/slots as per previous definition)
        this.app.use("/api/slots", availabilityRoutes);
    }

    public startApp() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}

export default App;
