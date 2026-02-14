import express from "express"
import { isAuth, login, logout, register, updateUserProfile } from "../controllers/userController.js";
import { sendLoginOTP, verifyLoginOTP } from "../controllers/otpController.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login);
userRouter.post('/login-otp-init', sendLoginOTP);
userRouter.post('/login-otp-verify', verifyLoginOTP);
userRouter.get('/is-auth', authUser, isAuth)
userRouter.put('/update-profile', authUser, updateUserProfile)
userRouter.get('/logout', authUser, logout)

export default userRouter;


