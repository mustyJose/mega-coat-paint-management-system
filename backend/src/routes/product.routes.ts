import { Router } from "express";
import {
  createProductController,
  deactivateProductController,
  getLowStockProductsController,
  getProductByIdController,
  getProductsController,
  updateProductController
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getProductsController);

router.get("/low-stock", getLowStockProductsController);

router.get("/:id", getProductByIdController);

router.post("/", requireAdmin, createProductController);

router.patch("/:id", requireAdmin, updateProductController);

router.delete("/:id", requireAdmin, deactivateProductController);

export default router;