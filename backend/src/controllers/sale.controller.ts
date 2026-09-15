import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createSale,
  getSaleById,
  getSales,
  getSalesReport,
  getSalesSummary
} from "../services/sale.service.js";

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

const isValidDateString = (value: string): boolean => {
  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

export const createSaleController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        message: "At least one sale item is required"
      });
      return;
    }

    for (const item of items) {
      if (
        item === null ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        res.status(400).json({
          message: "Each sale item must be a valid object"
        });
        return;
      }

      const { productId, quantity } = item as {
        productId?: unknown;
        quantity?: unknown;
      };

      const parsedProductId = Number(productId);
      const parsedQuantity = Number(quantity);

      if (!isPositiveInteger(parsedProductId)) {
        res.status(400).json({
          message: "Each product ID must be a positive integer"
        });
        return;
      }

      if (!isPositiveInteger(parsedQuantity)) {
        res.status(400).json({
          message: "Each quantity must be a positive integer"
        });
        return;
      }
    }

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required"
      });
      return;
    }

    const validatedItems = items.map((item) => {
      const { productId, quantity } = item as {
        productId: unknown;
        quantity: unknown;
      };

      return {
        productId: Number(productId),
        quantity: Number(quantity)
      };
    });

    const sale = await createSale({
      userId: req.user.userId,
      items: validatedItems
    });

    res.status(201).json(sale);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "At least one sale item is required" ||
        error.message.includes("not found") ||
        error.message.includes("inactive") ||
        error.message.includes("Insufficient stock")
      ) {
        res.status(400).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Create sale error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getSalesController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const sales = await getSales();

    res.status(200).json(sales);
  } catch (error) {
    console.error("Get sales error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getSalesSummaryController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const summary = await getSalesSummary();

    res.status(200).json(summary);
  } catch (error) {
    console.error("Get sales summary error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getSalesReportController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (
      startDate !== undefined &&
      typeof startDate !== "string"
    ) {
      res.status(400).json({
        message: "Start date must be a string"
      });
      return;
    }

    if (
      endDate !== undefined &&
      typeof endDate !== "string"
    ) {
      res.status(400).json({
        message: "End date must be a string"
      });
      return;
    }

    if (
      typeof startDate === "string" &&
      !isValidDateString(startDate)
    ) {
      res.status(400).json({
        message: "Invalid start date"
      });
      return;
    }

    if (
      typeof endDate === "string" &&
      !isValidDateString(endDate)
    ) {
      res.status(400).json({
        message: "Invalid end date"
      });
      return;
    }

    if (
      typeof startDate === "string" &&
      typeof endDate === "string" &&
      new Date(startDate) > new Date(endDate)
    ) {
      res.status(400).json({
        message: "Start date cannot be after end date"
      });
      return;
    }

    const report = await getSalesReport({
      startDate,
      endDate
    });

    res.status(200).json(report);
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message === "Invalid start date" ||
        error.message === "Invalid end date" ||
        error.message === "Start date cannot be after end date"
      )
    ) {
      res.status(400).json({
        message: error.message
      });
      return;
    }

    console.error("Get sales report error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getSaleByIdController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid sale ID"
      });
      return;
    }

    const sale = await getSaleById(id);

    res.status(200).json(sale);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Sale not found"
    ) {
      res.status(404).json({
        message: error.message
      });
      return;
    }

    console.error("Get sale error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};