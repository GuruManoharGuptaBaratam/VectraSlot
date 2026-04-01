import express from "express"

class App {
    app: express.Application
    port: string | number

    constructor() {
        this.app = express();
        this.port = 4035;
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
