import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { UserRole } from "../generated/prisma/enums.js";

interface LoginResult {
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: UserRole;
  };
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid username or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    env.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: env.jwtExpiresIn
    }
  );

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role
    }
  };
};