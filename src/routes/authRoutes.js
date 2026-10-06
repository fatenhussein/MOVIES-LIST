import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/logout", logoutUser);

export default router;
