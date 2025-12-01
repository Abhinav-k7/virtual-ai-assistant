import express from "express"
import { askToAssistant, getCurrentUser, updateAssistant, askToAssistantPublic } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant)
userRouter.post("/asktoassistant", isAuth, askToAssistant)
// Public endpoint for Chrome Extension (no auth required)
userRouter.post("/asktoassistant-public", askToAssistantPublic)

export default userRouter