import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createStockAdjustment,
  getInventory,
  getStockMovements
} from "../services/inventory.service.js";
import { StockMovementType } from "../generated/prisma/enums.js";

const validAdjustmentTypes: StockMovementType[] = [
  StockMovementType.PURCHASE,
  StockMovementType.ADJUSTMENT_IN,
  StockMovementType.ADJUSTMENT_OUT,
  StockMovementType.DAMAGE,
  StockMovementType.RETURN
];

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

export const getInventoryController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const inventory = await getInventory();

    res.status(200).json(inventory);
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getStockMovementsController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const movements = await getStockMovements();

    res.status(200).json(movements);
  } catch (error) {
    console.error("Get stock movements error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const createStockAdjustmentController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      productId,
      quantity,
      type,
      reference,
      note
    } = req.body;

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required"
      });
      return;
    }

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (!isPositiveInteger(parsedProductId)) {
      res.status(400).json({
        message: "Product ID must be a positive integer"
      });
      return;
    }

    if (!isPositiveInteger(parsedQuantity)) {
      res.status(400).json({
        message: "Quantity must be a positive integer"
      });
      return;
    }

    if (
      typeof type !== "string" ||
      !validAdjustmentTypes.includes(
        type as StockMovementType
      )
    ) {
      res.status(400).json({
        message: "Invalid stock adjustment type"
      });
      return;
    }

    if (
      reference !== undefined &&
      reference !== null &&
      typeof reference !== "string"
    ) {
      res.status(400).json({
        message: "Reference must be a string"
      });
      return;
    }

    if (
      note !== undefined &&
      note !== null &&
      typeof note !== "string"
    ) {
      res.status(400).json({
        message: "Note must be a string"
      });
      return;
    }

    const result = await createStockAdjustment({
      productId: parsedProductId,
      quantity: parsedQuantity,
      type: type as StockMovementType,
      reference,
      note,
      userId: req.user.userId
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Product not found") {
        res.status(404).json({
          message: error.message
        });
        return;
      }

      if (
        error.message === "Product is inactive" ||
        error.message === "Invalid stock adjustment type"
      ) {
        res.status(400).json({
          message: error.message
        });
        return;
      }

      if (error.message.startsWith("Insufficient stock")) {
        res.status(400).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Create stock adjustment error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};