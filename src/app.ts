import express, {type Express} from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js"
import busRouter from "./routes/bus.route.js"

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter)
app.use("/api/buses", busRouter)

export default app;

    