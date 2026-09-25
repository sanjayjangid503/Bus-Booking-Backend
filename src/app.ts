import express, {type Express, type Request, type Response} from "express";
import cors from "cors";

const app: Express = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
    })
})


export default app;

    