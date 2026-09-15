import { prisma } from "../config/database.js";

export const createCategory = async (name: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name
    }
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  return prisma.category.create({
    data: {
      name
    }
  });
};

export const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: {
      name: "asc"
    }
  });
};

export const updateCategory = async (
  id: number,
  name: string
) => {
  const category = await prisma.category.findUnique({
    where: {
      id
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
      NOT: {
        id
      }
    }
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  return prisma.category.update({
    where: {
      id
    },
    data: {
      name
    }
  });
};

export const deactivateCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: {
      id
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.category.update({
    where: {
      id
    },
    data: {
      isActive: false
    }
  });
};