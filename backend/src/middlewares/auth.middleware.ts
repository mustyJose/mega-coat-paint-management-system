import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { UserRole } from "../generated/prisma/enums.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: UserRole;
  };
}

interface AuthTokenPayload extends JwtPayload {
  userId: number;
  role: UserRole;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"]
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "number" ||
      !Number.isInteger(decoded.userId) ||
      decoded.userId <= 0 ||
      (decoded.role !== UserRole.ADMIN &&
        decoded.role !== UserRole.CASHIER)
    ) {
      res.status(401).json({
        message: "Invalid authentication token"
      });
      return;
    }

    const payload = decoded as AuthTokenPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId
      },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        message: "User account is inactive or unavailable"
      });
      return;
    }

    req.user = {
      userId: user.id,
      role: user.role
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
};