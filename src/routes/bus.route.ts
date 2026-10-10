import express from "express"
import { searchBusController, getBusController, getSeatController } from "../controllers/bus.controller.js"

const Router = express.Router()

Router.get("/search", searchBusController)
Router.get("/:id", getBusController)
Router.get("/:id/seats", getSeatController)

export default Router