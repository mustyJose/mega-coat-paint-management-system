import { prisma } from "../config/database.js";
import { StockMovementType } from "../generated/prisma/enums.js";

interface StockMovementData {
  productId: number;
  type: StockMovementType;
  quantity: number;
  reference?: string;
  note?: string;
  userId: number;
}

interface ReceiveStockData {
  productId: number;
  quantity: number;
  reference?: string;
  note?: string;
  userId: number;
}

const stockIncreasingTypes: StockMovementType[] = [
  StockMovementType.PURCHASE,
  StockMovementType.RETURN,
  StockMovementType.ADJUSTMENT_IN
];

const stockDecreasingTypes: StockMovementType[] = [
  StockMovementType.SALE,
  StockMovementType.ADJUSTMENT_OUT,
  StockMovementType.DAMAGE
];

export const createStockMovement = async (
  data: StockMovementData
) => {
  if (!Number.isInteger(data.productId) || data.productId <= 0) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const isIncreasing = stockIncreasingTypes.includes(data.type);
  const isDecreasing = stockDecreasingTypes.includes(data.type);

  if (!isIncreasing && !isDecreasing) {
    throw new Error("Invalid stock movement type");
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

    let updatedProduct;

    if (isIncreasing) {
      updatedProduct = await tx.product.update({
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

      if (stockUpdate.count !== 1) {
        throw new Error("Insufficient stock");
      }

      updatedProduct = await tx.product.findUnique({
        where: {
          id: data.productId
        }
      });

      if (!updatedProduct) {
        throw new Error("Product not found");
      }
    }

    const movement = await tx.stockMovement.create({
      data: {
        type: data.type,
        quantity: data.quantity,
        reference: data.reference,
        note: data.note,
        productId: data.productId,
        userId: data.userId
      },
      include: {
        product: true,
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
      movement,
      product: updatedProduct
    };
  });
};

export const receiveStock = async (
  data: ReceiveStockData
) => {
  if (!Number.isInteger(data.productId) || data.productId <= 0) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
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

    const updatedProduct = await tx.product.update({
      where: {
        id: data.productId
      },
      data: {
        quantity: {
          increment: data.quantity
        }
      }
    });

    const movement = await tx.stockMovement.create({
      data: {
        type: StockMovementType.PURCHASE,
        quantity: data.quantity,
        reference: data.reference,
        note: data.note,
        productId: data.productId,
        userId: data.userId
      },
      include: {
        product: true,
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
      movement,
      product: updatedProduct
    };
  });
};

export const getStockMovements = async () => {
  return prisma.stockMovement.findMany({
    include: {
      product: true,
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

export const getProductStockMovements = async (
  productId: number
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.stockMovement.findMany({
    where: {
      productId
    },
    include: {
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