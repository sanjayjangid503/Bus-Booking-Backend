import express, {type Express, type Request, type Response} from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js"

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter)

export default app;

    