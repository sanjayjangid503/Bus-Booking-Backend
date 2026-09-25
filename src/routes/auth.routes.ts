import express from "express"
import { registerController } from "../controllers/auth.controller.js"


const Router = express.Router()

Router.post("/register", registerController)




export default Router