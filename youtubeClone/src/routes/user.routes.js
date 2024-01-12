import {Router} from "express"
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js"
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js"
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
userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
export default userRouter 