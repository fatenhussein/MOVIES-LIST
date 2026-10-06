import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/authController.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import { registerSchema, loginSchema } from "../validators/authValidators.ts";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/logout", logoutUser);

export default router;
