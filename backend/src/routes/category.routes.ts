import { Router } from "express";
import {
  createCategoryController,
  deactivateCategoryController,
  getCategoriesController,
  updateCategoryController
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getCategoriesController);

router.post("/", requireAdmin, createCategoryController);

router.patch("/:id", requireAdmin, updateCategoryController);

router.delete("/:id", requireAdmin, deactivateCategoryController);

export default router;