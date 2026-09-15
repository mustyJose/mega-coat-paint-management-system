import { Response } from "express";
import { UserRole } from "../generated/prisma/enums.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createUser,
  getUserById,
  getUsers,
  updateUserStatus
} from "../services/user.service.js";

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

export const createUserController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      username,
      password,
      role
    } = req.body;

    if (
      typeof firstName !== "string" ||
      firstName.trim().length === 0
    ) {
      res.status(400).json({
        message: "First name is required"
      });
      return;
    }

    if (
      typeof lastName !== "string" ||
      lastName.trim().length === 0
    ) {
      res.status(400).json({
        message: "Last name is required"
      });
      return;
    }

    if (
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      res.status(400).json({
        message: "Username is required"
      });
      return;
    }

    if (
      typeof password !== "string" ||
      password.length < 6
    ) {
      res.status(400).json({
        message: "Password must be at least 6 characters"
      });
      return;
    }

    if (
      role !== UserRole.ADMIN &&
      role !== UserRole.CASHIER
    ) {
      res.status(400).json({
        message: "Role must be ADMIN or CASHIER"
      });
      return;
    }

    const user = await createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim().toLowerCase(),
      password,
      role
    });

    res.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Username already exists"
    ) {
      res.status(409).json({
        message: error.message
      });
      return;
    }

    console.error("Create user error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getUsersController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await getUsers();

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getUserByIdController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid user ID"
      });
      return;
    }

    const user = await getUserById(id);

    res.status(200).json(user);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      res.status(404).json({
        message: error.message
      });
      return;
    }

    console.error("Get user error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const updateUserStatusController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { isActive } = req.body;

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid user ID"
      });
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json({
        message: "isActive must be a boolean"
      });
      return;
    }

    const user = await updateUserStatus(id, isActive);

    res.status(200).json(user);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      res.status(404).json({
        message: error.message
      });
      return;
    }

    console.error("Update user status error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};