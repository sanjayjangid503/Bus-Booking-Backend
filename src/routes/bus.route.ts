import express from "express"
import { searchBusController, getBusController } from "../controllers/bus.controller.js"

const Router = express.Router()

Router.get("/search", searchBusController)
Router.get("/:id", getBusController)

export default Router