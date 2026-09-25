import { Response } from "express";
import { Request } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deactivateProduct,
  getLowStockProducts,
  getProductById,
  getProducts,
  updateProduct
} from "../services/product.service.js";

export const createProductController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      sku,
      brand,
      unit,
      costPrice,
      sellingPrice,
      quantity,
      reorderLevel,
      categoryId
    } = req.body;

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required"
      });
      return;
    }

    if (!name || typeof name !== "string") {
      res.status(400).json({
        message: "Product name is required"
      });
      return;
    }

    if (!sku || typeof sku !== "string") {
      res.status(400).json({
        message: "Product SKU is required"
      });
      return;
    }

    if (!unit || typeof unit !== "string") {
      res.status(400).json({
        message: "Product unit is required"
      });
      return;
    }

    if (
      typeof costPrice !== "number" ||
      typeof sellingPrice !== "number"
    ) {
      res.status(400).json({
        message: "Cost price and selling price must be numbers"
      });
      return;
    }

    if (costPrice < 0 || sellingPrice < 0) {
      res.status(400).json({
        message: "Prices cannot be negative"
      });
      return;
    }

    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 0)
    ) {
      res.status(400).json({
        message: "Quantity must be a non-negative integer"
      });
      return;
    }

    if (
      reorderLevel !== undefined &&
      (!Number.isInteger(reorderLevel) || reorderLevel < 0)
    ) {
      res.status(400).json({
        message: "Reorder level must be a non-negative integer"
      });
      return;
    }

    if (!Number.isInteger(categoryId)) {
      res.status(400).json({
        message: "Category ID must be an integer"
      });
      return;
    }

    const product = await createProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      brand: brand?.trim(),
      unit: unit.trim(),
      costPrice,
      sellingPrice,
      quantity,
      reorderLevel,
      categoryId,
      userId: req.user.userId
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Product SKU already exists") {
        res.status(409).json({
          message: error.message
        });
        return;
      }

      if (
        error.message === "Category not found" ||
        error.message === "Category is inactive"
      ) {
        res.status(400).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Create product error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getProductsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await getProducts();

    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getLowStockProductsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await getLowStockProducts();

    res.status(200).json(products);
  } catch (error) {
    console.error("Get low stock products error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getProductByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        message: "Invalid product ID"
      });
      return;
    }

    const product = await getProductById(id);

    res.status(200).json(product);
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

    console.error("Get product error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const updateProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        message: "Invalid product ID"
      });
      return;
    }

    const {
      name,
      sku,
      brand,
      unit,
      costPrice,
      sellingPrice,
      reorderLevel,
      categoryId
    } = req.body;

    if (name !== undefined && typeof name !== "string") {
      res.status(400).json({
        message: "Product name must be a string"
      });
      return;
    }

    if (sku !== undefined && typeof sku !== "string") {
      res.status(400).json({
        message: "Product SKU must be a string"
      });
      return;
    }

    if (brand !== undefined && typeof brand !== "string") {
      res.status(400).json({
        message: "Brand must be a string"
      });
      return;
    }

    if (unit !== undefined && typeof unit !== "string") {
      res.status(400).json({
        message: "Unit must be a string"
      });
      return;
    }

    if (
      costPrice !== undefined &&
      (typeof costPrice !== "number" || costPrice < 0)
    ) {
      res.status(400).json({
        message: "Cost price must be a non-negative number"
      });
      return;
    }

    if (
      sellingPrice !== undefined &&
      (typeof sellingPrice !== "number" || sellingPrice < 0)
    ) {
      res.status(400).json({
        message: "Selling price must be a non-negative number"
      });
      return;
    }

    if (
      reorderLevel !== undefined &&
      (!Number.isInteger(reorderLevel) || reorderLevel < 0)
    ) {
      res.status(400).json({
        message: "Reorder level must be a non-negative integer"
      });
      return;
    }

    if (
      categoryId !== undefined &&
      !Number.isInteger(categoryId)
    ) {
      res.status(400).json({
        message: "Category ID must be an integer"
      });
      return;
    }

    const product = await updateProduct(id, {
      name: name?.trim(),
      sku: sku?.trim().toUpperCase(),
      brand: brand?.trim(),
      unit: unit?.trim(),
      costPrice,
      sellingPrice,
      reorderLevel,
      categoryId
    });

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Product not found") {
        res.status(404).json({
          message: error.message
        });
        return;
      }

      if (
        error.message === "Product SKU already exists" ||
        error.message === "Category not found" ||
        error.message === "Category is inactive"
      ) {
        res.status(400).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Update product error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const deactivateProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        message: "Invalid product ID"
      });
      return;
    }

    const product = await deactivateProduct(id);

    res.status(200).json(product);
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

    console.error("Deactivate product error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};