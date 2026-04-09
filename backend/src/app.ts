import express from "express";
import * as dotenv from 'dotenv';
<<<<<<< HEAD
import authRoutes from "./auth/auth.routes";
import adminRoutes from "./admin/admin.routes";
=======
import authRoutes from "./auth/routes/auth.routes";
import slotRoutes from "./slots/slot.routes";
>>>>>>> 29a85ac (Slot Management Module)

dotenv.config();

class App {
    public app: express.Application;
    private port: string | number;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4035;

        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes() {
        this.app.get("/health-check", (req, res) => {
            res.status(200).json({ status: "OK", message: "Server is healthy" });
        });

        // Use authentication routes
        this.app.use("/api/auth", authRoutes);
        
<<<<<<< HEAD
        // Use Admin routes
        this.app.use("/api/admin", adminRoutes);
=======
        // Use slot routes
        this.app.use("/api/slots", slotRoutes);
>>>>>>> 29a85ac (Slot Management Module)
    }

    public startApp() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}

export default App;
