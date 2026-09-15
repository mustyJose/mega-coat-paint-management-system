import { Router } from "express";
import {
  createSaleController,
  getSaleByIdController,
  getSalesController,
  getSalesReportController,
  getSalesSummaryController
} from "../controllers/sale.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createSaleController);

router.get("/summary", getSalesSummaryController);

router.get("/report", requireAdmin, getSalesReportController);

router.get("/", getSalesController);

router.get("/:id", getSaleByIdController);

export default router;