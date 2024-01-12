import {Router} from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
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
userRouter.route("/refreshAccessToken").post(refreshAccessToken)//end point to renew access token
export default userRouter 