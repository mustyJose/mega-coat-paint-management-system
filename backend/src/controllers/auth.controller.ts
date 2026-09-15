import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { login } from "../services/auth.service.js";

export const loginController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

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
      password.length === 0
    ) {
      res.status(400).json({
        message: "Password is required"
      });
      return;
    }

    const result = await login(
      username.trim().toLowerCase(),
      password
    );

    res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid username or password"
    ) {
      res.status(401).json({
        message: error.message
      });
      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getCurrentUser = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  res.status(200).json({
    user: req.user
  });
};