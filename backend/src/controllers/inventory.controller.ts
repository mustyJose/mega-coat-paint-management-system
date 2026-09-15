import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createStockMovement,
  getProductStockMovements,
  getStockMovements,
  receiveStock
} from "../services/inventory.service.js";
import { StockMovementType } from "../generated/prisma/enums.js";

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

const isValidOptionalString = (
  value: unknown
): value is string | undefined => {
  return value === undefined || typeof value === "string";
};

const allowedManualMovementTypes: StockMovementType[] = [
  StockMovementType.ADJUSTMENT_IN,
  StockMovementType.ADJUSTMENT_OUT,
  StockMovementType.DAMAGE,
  StockMovementType.RETURN
];

export const createStockMovementController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      productId,
      type,
      quantity,
      reference,
      note
    } = req.body;

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (!isPositiveInteger(parsedProductId)) {
      res.status(400).json({
        message: "Product ID must be a positive integer"
      });
      return;
    }

    if (
      !Object.values(StockMovementType).includes(type) ||
      !allowedManualMovementTypes.includes(type)
    ) {
      res.status(400).json({
        message:
          "Invalid stock movement type. Use ADJUSTMENT_IN, ADJUSTMENT_OUT, DAMAGE, or RETURN."
      });
      return;
    }

    if (!isPositiveInteger(parsedQuantity)) {
      res.status(400).json({
        message: "Quantity must be a positive integer"
      });
      return;
    }

    if (!isValidOptionalString(reference)) {
      res.status(400).json({
        message: "Reference must be a string"
      });
      return;
    }

    if (!isValidOptionalString(note)) {
      res.status(400).json({
        message: "Note must be a string"
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required"
      });
      return;
    }

    const trimmedReference =
      reference?.trim() || undefined;

    const trimmedNote =
      note?.trim() || undefined;

    const result = await createStockMovement({
      productId: parsedProductId,
      type,
      quantity: parsedQuantity,
      reference: trimmedReference,
      note: trimmedNote,
      userId: req.user.userId
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Product not found" ||
        error.message === "Product is inactive" ||
        error.message === "Invalid stock movement type" ||
        error.message === "Quantity must be greater than zero" ||
        error.message === "Insufficient stock"
      ) {
        res.status(400).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Create stock movement error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const receiveStockController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      productId,
      quantity,
      reference,
      note
    } = req.body;

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

    if (!isValidOptionalString(reference)) {
      res.status(400).json({
        message: "Reference must be a string"
      });
      return;
    }

    if (!isValidOptionalString(note)) {
      res.status(400).json({
        message: "Note must be a string"
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required"
      });
      return;
    }

    const trimmedReference =
      reference?.trim() || undefined;

    const trimmedNote =
      note?.trim() || undefined;

    const result = await receiveStock({
      productId: parsedProductId,
      quantity: parsedQuantity,
      reference: trimmedReference,
      note: trimmedNote,
      userId: req.user.userId
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Product not found" ||
        error.message === "Product is inactive" ||
        error.message === "Quantity must be greater than zero"
      ) {
        res.status(400).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Receive stock error:", error);

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

export const getProductStockMovementsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const productId = Number(req.params.productId);

    if (!isPositiveInteger(productId)) {
      res.status(400).json({
        message: "Invalid product ID"
      });
      return;
    }

    const movements = await getProductStockMovements(productId);

    res.status(200).json(movements);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      res.status(404).json({
        message: error.message
      });
      return;
    }

    console.error("Get product stock movements error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};