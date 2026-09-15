import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware.js";
import { UserRole } from "../generated/prisma/enums.js";

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      message: "Admin access required"
    });
    return;
  }

  next();
};