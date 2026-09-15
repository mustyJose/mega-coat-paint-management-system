import { Request, Response } from "express";
import {
  createProduct,
  deactivateProduct,
  getLowStockProducts,
  getProductById,
  getProducts,
  updateProduct
} from "../services/product.service.js";

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

const isValidNumber = (value: number): boolean => {
  return Number.isFinite(value);
};

export const createProductController = async (
  req: Request,
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

    if (typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({
        message: "Product name is required"
      });
      return;
    }

    if (typeof sku !== "string" || sku.trim().length === 0) {
      res.status(400).json({
        message: "SKU is required"
      });
      return;
    }

    if (typeof unit !== "string" || unit.trim().length === 0) {
      res.status(400).json({
        message: "Unit is required"
      });
      return;
    }

    if (
      brand !== undefined &&
      brand !== null &&
      typeof brand !== "string"
    ) {
      res.status(400).json({
        message: "Brand must be a string"
      });
      return;
    }

    const parsedCostPrice = Number(costPrice);
    const parsedSellingPrice = Number(sellingPrice);
    const parsedQuantity = Number(quantity);
    const parsedReorderLevel = Number(reorderLevel);
    const parsedCategoryId = Number(categoryId);

    if (
      !isValidNumber(parsedCostPrice) ||
      parsedCostPrice < 0
    ) {
      res.status(400).json({
        message: "Cost price must be a valid non-negative number"
      });
      return;
    }

    if (
      !isValidNumber(parsedSellingPrice) ||
      parsedSellingPrice < 0
    ) {
      res.status(400).json({
        message: "Selling price must be a valid non-negative number"
      });
      return;
    }

    if (
      !isValidNumber(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      res.status(400).json({
        message: "Quantity must be a valid non-negative integer"
      });
      return;
    }

    if (
      !isValidNumber(parsedReorderLevel) ||
      !Number.isInteger(parsedReorderLevel) ||
      parsedReorderLevel < 0
    ) {
      res.status(400).json({
        message: "Reorder level must be a valid non-negative integer"
      });
      return;
    }

    if (!isPositiveInteger(parsedCategoryId)) {
      res.status(400).json({
        message: "Invalid category ID"
      });
      return;
    }

    const product = await createProduct({
      name: name.trim(),
      sku: sku.trim(),
      brand:
        typeof brand === "string" && brand.trim().length > 0
          ? brand.trim()
          : undefined,
      unit: unit.trim(),
      costPrice: parsedCostPrice,
      sellingPrice: parsedSellingPrice,
      quantity: parsedQuantity,
      reorderLevel: parsedReorderLevel,
      categoryId: parsedCategoryId
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

      if (error.message === "Category not found") {
        res.status(404).json({
          message: error.message
        });
        return;
      }

      if (error.message === "Category is inactive") {
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

export const getProductByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!isPositiveInteger(id)) {
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

    console.error("Get product by ID error:", error);

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

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid product ID"
      });
      return;
    }

    const bodyKeys = Object.keys(req.body ?? {});

    if (bodyKeys.length === 0) {
      res.status(400).json({
        message: "At least one field is required for update"
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
      quantity,
      reorderLevel,
      categoryId
    } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      res.status(400).json({
        message: "Product name must be a non-empty string"
      });
      return;
    }

    if (
      sku !== undefined &&
      (typeof sku !== "string" || sku.trim().length === 0)
    ) {
      res.status(400).json({
        message: "SKU must be a non-empty string"
      });
      return;
    }

    if (
      unit !== undefined &&
      (typeof unit !== "string" || unit.trim().length === 0)
    ) {
      res.status(400).json({
        message: "Unit must be a non-empty string"
      });
      return;
    }

    if (
      brand !== undefined &&
      brand !== null &&
      typeof brand !== "string"
    ) {
      res.status(400).json({
        message: "Brand must be a string"
      });
      return;
    }

    let parsedCostPrice: number | undefined;
    let parsedSellingPrice: number | undefined;
    let parsedQuantity: number | undefined;
    let parsedReorderLevel: number | undefined;
    let parsedCategoryId: number | undefined;

    if (costPrice !== undefined) {
      parsedCostPrice = Number(costPrice);

      if (
        !isValidNumber(parsedCostPrice) ||
        parsedCostPrice < 0
      ) {
        res.status(400).json({
          message: "Cost price must be a valid non-negative number"
        });
        return;
      }
    }

    if (sellingPrice !== undefined) {
      parsedSellingPrice = Number(sellingPrice);

      if (
        !isValidNumber(parsedSellingPrice) ||
        parsedSellingPrice < 0
      ) {
        res.status(400).json({
          message: "Selling price must be a valid non-negative number"
        });
        return;
      }
    }

    if (quantity !== undefined) {
      parsedQuantity = Number(quantity);

      if (
        !isValidNumber(parsedQuantity) ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 0
      ) {
        res.status(400).json({
          message: "Quantity must be a valid non-negative integer"
        });
        return;
      }
    }

    if (reorderLevel !== undefined) {
      parsedReorderLevel = Number(reorderLevel);

      if (
        !isValidNumber(parsedReorderLevel) ||
        !Number.isInteger(parsedReorderLevel) ||
        parsedReorderLevel < 0
      ) {
        res.status(400).json({
          message: "Reorder level must be a valid non-negative integer"
        });
        return;
      }
    }

    if (categoryId !== undefined) {
      parsedCategoryId = Number(categoryId);

      if (!isPositiveInteger(parsedCategoryId)) {
        res.status(400).json({
          message: "Invalid category ID"
        });
        return;
      }
    }

    const product = await updateProduct(id, {
      ...(name !== undefined && {
        name: name.trim()
      }),
      ...(sku !== undefined && {
        sku: sku.trim()
      }),
      ...(brand !== undefined && {
        brand: brand === null ? "" : brand.trim()
      }),
      ...(unit !== undefined && {
        unit: unit.trim()
      }),
      ...(parsedCostPrice !== undefined && {
        costPrice: parsedCostPrice
      }),
      ...(parsedSellingPrice !== undefined && {
        sellingPrice: parsedSellingPrice
      }),
      ...(parsedQuantity !== undefined && {
        quantity: parsedQuantity
      }),
      ...(parsedReorderLevel !== undefined && {
        reorderLevel: parsedReorderLevel
      }),
      ...(parsedCategoryId !== undefined && {
        categoryId: parsedCategoryId
      })
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

      if (error.message === "Product SKU already exists") {
        res.status(409).json({
          message: error.message
        });
        return;
      }

      if (error.message === "Category not found") {
        res.status(404).json({
          message: error.message
        });
        return;
      }

      if (error.message === "Category is inactive") {
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

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid product ID"
      });
      return;
    }

    const product = await deactivateProduct(id);

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
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