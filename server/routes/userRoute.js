import express from "express";
import {
  checkAuth,
  login,
  signUp,
  updateProfile,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRoute = express.Router();

userRoute.post("/signup", signUp);
userRoute.post("/login", login);
userRoute.put("/update-profile", protectRoute, updateProfile);
userRoute.get("/check", protectRoute, checkAuth);

export default userRoute;
