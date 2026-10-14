import express from "express"
import { searchBusController, getBusController, getSeatController, lockSeatController} from "../controllers/bus.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const Router = express.Router()

Router.get("/search", searchBusController)
Router.get("/:id", getBusController)
Router.get("/:id/seats", getSeatController)
Router.post("/:id/seats/lock", protect, lockSeatController)

export default Router