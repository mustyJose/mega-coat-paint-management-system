import { prisma } from "../config/database.js";
import { StockMovementType } from "../generated/prisma/enums.js";

interface StockAdjustmentData {
  productId: number;
  quantity: number;
  type: StockMovementType;
  reference?: string;
  note?: string;
  userId: number;
}

const stockInTypes: StockMovementType[] = [
  StockMovementType.PURCHASE,
  StockMovementType.ADJUSTMENT_IN,
  StockMovementType.RETURN
];

const stockOutTypes: StockMovementType[] = [
  StockMovementType.ADJUSTMENT_OUT,
  StockMovementType.DAMAGE
];

export const getInventory = async () => {
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

export const getStockMovements = async () => {
  return prisma.stockMovement.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true
        }
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const createStockAdjustment = async (
  data: StockAdjustmentData
) => {
  if (!Number.isInteger(data.productId) || data.productId <= 0) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
    throw new Error("Stock quantity must be greater than zero");
  }

  if (!stockInTypes.includes(data.type) && !stockOutTypes.includes(data.type)) {
    throw new Error("Invalid stock adjustment type");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: data.productId
      }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("Product is inactive");
    }

    const isStockIn = stockInTypes.includes(data.type);

    if (isStockIn) {
      await tx.product.update({
        where: {
          id: data.productId
        },
        data: {
          quantity: {
            increment: data.quantity
          }
        }
      });
    } else {
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: data.productId,
          isActive: true,
          quantity: {
            gte: data.quantity
          }
        },
        data: {
          quantity: {
            decrement: data.quantity
          }
        }
      });

      if (stockUpdate.count === 0) {
        throw new Error(
          `Insufficient stock for ${product.name}. Current stock is ${product.quantity} ${product.unit}.`
        );
      }
    }

    const updatedProduct = await tx.product.findUnique({
      where: {
        id: data.productId
      },
      include: {
        category: true
      }
    });

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    const movement = await tx.stockMovement.create({
      data: {
        type: data.type,
        quantity: data.quantity,
        reference: data.reference?.trim() || null,
        note: data.note?.trim() || null,
        productId: data.productId,
        userId: data.userId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            role: true
          }
        }
      }
    });

    return {
      product: updatedProduct,
      movement
    };
  });
};