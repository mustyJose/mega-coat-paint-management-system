import { Router } from "express";
import {
  getCurrentUser,
  loginController
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginController);
router.get("/me", authenticate, getCurrentUser);

export default router;