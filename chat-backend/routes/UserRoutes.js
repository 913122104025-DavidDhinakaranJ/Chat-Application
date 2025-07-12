import express from 'express';
import { CheckAuth, loginUser, registerUser, updateUser } from '../controllers/UserController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post("/signup", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/check", authMiddleware, CheckAuth);
userRouter.put("/update", authMiddleware, updateUser);

export default userRouter;