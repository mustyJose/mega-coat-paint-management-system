import { Request, Response } from "express";
import { getDashboardSummary } from "../services/dashboard.service.js";

export const getDashboardSummaryController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const dashboard = await getDashboardSummary();

    res.status(200).json(dashboard);
  } catch (error) {
    console.error("Get dashboard summary error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};