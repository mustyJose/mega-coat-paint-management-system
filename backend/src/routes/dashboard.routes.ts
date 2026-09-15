import { Router } from "express";
import { getDashboardSummaryController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getDashboardSummaryController);

export default router;