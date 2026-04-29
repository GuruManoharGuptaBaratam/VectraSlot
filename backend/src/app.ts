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

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4035;
        this.allowedOrigins = this.getAllowedOrigins();

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

    private initializeMiddlewares() {
        this.app.use(
            cors({
                origin: (origin, callback) => {
                    if (!origin || this.allowedOrigins.length === 0 || this.allowedOrigins.includes(origin)) {
                        callback(null, true);
                        return;
                    }

                    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
                },
            })
        );
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
