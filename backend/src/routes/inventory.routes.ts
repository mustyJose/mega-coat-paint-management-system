import { Router } from "express";
import {
  createStockMovementController,
  getProductStockMovementsController,
  getStockMovementsController,
  receiveStockController
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getStockMovementsController);

router.get(
  "/product/:productId",
  getProductStockMovementsController
);

router.post("/", requireAdmin, createStockMovementController);

router.post("/receive", requireAdmin, receiveStockController);

export default router;