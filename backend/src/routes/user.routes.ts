import { Router } from "express";
import {
  createUserController,
  getUserByIdController,
  getUsersController,
  updateUserStatusController
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.post("/", createUserController);
router.get("/", getUsersController);
router.get("/:id", getUserByIdController);
router.patch("/:id/status", updateUserStatusController);

export default router;