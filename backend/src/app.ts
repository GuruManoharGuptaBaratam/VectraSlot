import express from "express"
import * as dotenv from 'dotenv';
dotenv.config();

class App {
    app: express.Application
    port: string | number | undefined

    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.sample_route()
    }

    startApp() {
        this.app.listen(this.port, () => {
            console.log("Server started on port 4035")
        })
    }

    public sample_route() {
        this.app.get("/health-check", (req, res) => {
            res.send("Health OK")
        })
    }
}

export default App;
