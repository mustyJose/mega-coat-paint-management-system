import { prisma } from "../config/database.js";

interface CreateProductData {
  name: string;
  sku: string;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  quantity?: number;
  reorderLevel?: number;
  categoryId: number;
  userId: number;
}

interface UpdateProductData {
  name?: string;
  sku?: string;
  brand?: string;
  unit?: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderLevel?: number;
  categoryId?: number;
}

export const createProduct = async (
  data: CreateProductData
) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      sku: data.sku
    }
  });

  if (existingProduct) {
    throw new Error("Product SKU already exists");
  }

  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (!category.isActive) {
    throw new Error("Category is inactive");
  }

  const openingQuantity = data.quantity ?? 0;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        brand: data.brand,
        unit: data.unit,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        quantity: openingQuantity,
        reorderLevel: data.reorderLevel ?? 5,
        categoryId: data.categoryId
      },
      include: {
        category: true
      }
    });

    if (openingQuantity > 0) {
      await tx.stockMovement.create({
        data: {
          type: "ADJUSTMENT_IN",
          quantity: openingQuantity,
          reference: `OPENING-${product.sku}`,
          note: "Opening stock",
          productId: product.id,
          userId: data.userId
        }
      });
    }

    return product;
  });
};

export const getProducts = async () => {
  return prisma.product.findMany({
    where: {
      isActive: true
    },
    include: {
      category: true
    },
    orderBy: {
      name: "asc"
    }
  });
};

export const getLowStockProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    include: {
      category: true
    },
    orderBy: {
      quantity: "asc"
    }
  });

  return products.filter(
    (product) => product.quantity > 0 && product.quantity <= product.reorderLevel
  );
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id
    },
    include: {
      category: true
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const updateProduct = async (
  id: number,
  data: UpdateProductData
) => {
  const product = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (data.sku && data.sku !== product.sku) {
    const existingProduct = await prisma.product.findUnique({
      where: {
        sku: data.sku
      }
    });

    if (existingProduct) {
      throw new Error("Product SKU already exists");
    }
  }

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId
      }
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (!category.isActive) {
      throw new Error("Category is inactive");
    }
  }

  return prisma.product.update({
    where: {
      id
    },
    data,
    include: {
      category: true
    }
  });
};

export const deactivateProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.product.update({
    where: {
      id
    },
    data: {
      isActive: false
    },
    include: {
      category: true
    }
  });
};