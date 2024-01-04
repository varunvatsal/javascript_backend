import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from '../middlewares/multer.middleware.js'
const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar", // this name should be same in frontend field and backend field
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
// userRouter.route("/login").post(loginUser)
export default userRouter 