import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import { UserRole } from "../generated/prisma/enums.js";

interface CreateUserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: UserRole;
}

export const createUser = async (data: CreateUserData) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username
    }
  });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      passwordHash,
      role: data.role
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserStatus = async (
  id: number,
  isActive: boolean
) => {
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: {
      id
    },
    data: {
      isActive
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
};