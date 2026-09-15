import { Request, Response } from "express";
import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory
} from "../services/category.service.js";

export const createCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({
        message: "Category name is required"
      });
      return;
    }

    const category = await createCategory(name.trim());

    res.status(201).json(category);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Category already exists"
    ) {
      res.status(409).json({
        message: error.message
      });
      return;
    }

    console.error("Create category error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getCategoriesController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await getCategories();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "Invalid category ID"
      });
      return;
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({
        message: "Category name is required"
      });
      return;
    }

    const category = await updateCategory(id, name.trim());

    res.status(200).json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        res.status(404).json({
          message: error.message
        });
        return;
      }

      if (error.message === "Category already exists") {
        res.status(409).json({
          message: error.message
        });
        return;
      }
    }

    console.error("Update category error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const deactivateCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "Invalid category ID"
      });
      return;
    }

    const category = await deactivateCategory(id);

    res.status(200).json(category);
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      res.status(404).json({
        message: error.message
      });
      return;
    }

    console.error("Deactivate category error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};