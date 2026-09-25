import { Router } from "express";
import {
  createStockAdjustmentController,
  getInventoryController,
  getStockMovementsController
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getInventoryController);
router.get("/movements", getStockMovementsController);
router.post("/adjustments", createStockAdjustmentController);

export default router;