import { randomUUID } from "node:crypto";
import { prisma } from "../config/database.js";

interface SaleItemData {
  productId: number;
  quantity: number;
}

interface CreateSaleData {
  userId: number;
  items: SaleItemData[];
}

interface SalesReportData {
  startDate?: string;
  endDate?: string;
}

export const createSale = async (data: CreateSaleData) => {
  if (data.items.length === 0) {
    throw new Error("At least one sale item is required");
  }

  for (const item of data.items) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw new Error("Invalid product ID");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Sale quantity must be greater than zero");
    }
  }

  const itemQuantities = new Map<number, number>();

  for (const item of data.items) {
    const currentQuantity = itemQuantities.get(item.productId) ?? 0;

    itemQuantities.set(
      item.productId,
      currentQuantity + item.quantity
    );
  }

  return prisma.$transaction(async (tx) => {
    const processedItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      subtotal: number;
      productName: string;
    }[] = [];

    let totalAmount = 0;

    for (const [productId, quantity] of itemQuantities) {
      const product = await tx.product.findUnique({
        where: {
          id: productId
        }
      });

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is inactive`);
      }

      const unitPrice = product.sellingPrice;
      const costPrice = product.costPrice;
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      processedItems.push({
        productId: product.id,
        quantity,
        unitPrice,
        costPrice,
        subtotal,
        productName: product.name
      });
    }

    const reference = `SALE-${Date.now()}-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)}`;

    const sale = await tx.sale.create({
      data: {
        totalAmount,
        reference,
        userId: data.userId,
        items: {
          create: processedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
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

    for (const item of processedItems) {
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: item.productId,
          isActive: true,
          quantity: {
            gte: item.quantity
          }
        },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });

      if (stockUpdate.count !== 1) {
        throw new Error(
          `Insufficient stock for ${item.productName}`
        );
      }

      await tx.stockMovement.create({
        data: {
          type: "SALE",
          quantity: item.quantity,
          reference: sale.reference,
          note: `Sale of ${item.productName}`,
          productId: item.productId,
          userId: data.userId
        }
      });
    }

    return sale;
  });
};

export const getSales = async () => {
  return prisma.sale.findMany({
    orderBy: {
      createdAt: "desc"
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
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true
            }
          }
        }
      }
    }
  });
};

export const getSalesSummary = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [sales, todaySalesRecords] = await Promise.all([
    prisma.sale.findMany({
      include: {
        items: {
          select: {
            quantity: true,
            subtotal: true,
            costPrice: true
          }
        }
      }
    }),

    prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      include: {
        items: {
          select: {
            quantity: true,
            subtotal: true,
            costPrice: true
          }
        }
      }
    })
  ]);

  const totalSales = sales.length;
  const todaySales = todaySalesRecords.length;

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const todayRevenue = todaySalesRecords.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const totalCost = sales.reduce(
    (total, sale) =>
      total +
      sale.items.reduce(
        (itemTotal, item) =>
          itemTotal + item.quantity * item.costPrice,
        0
      ),
    0
  );

  const todayCost = todaySalesRecords.reduce(
    (total, sale) =>
      total +
      sale.items.reduce(
        (itemTotal, item) =>
          itemTotal + item.quantity * item.costPrice,
        0
      ),
    0
  );

  const totalProfit = totalRevenue - totalCost;
  const todayProfit = todayRevenue - todayCost;

  return {
    totalSales,
    totalRevenue,
    totalCost,
    totalProfit,
    todaySales,
    todayRevenue,
    todayCost,
    todayProfit
  };
};

export const getSalesReport = async (data: SalesReportData) => {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (data.startDate) {
    startDate = new Date(`${data.startDate}T00:00:00`);

    if (Number.isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }
  }

  if (data.endDate) {
    endDate = new Date(`${data.endDate}T23:59:59.999`);

    if (Number.isNaN(endDate.getTime())) {
      throw new Error("Invalid end date");
    }
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Start date cannot be after end date");
  }

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {})
      }
    },
    orderBy: {
      createdAt: "desc"
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
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true
            }
          }
        }
      }
    }
  });

  const totalSales = sales.length;

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const totalCost = sales.reduce(
    (total, sale) =>
      total +
      sale.items.reduce(
        (itemTotal, item) =>
          itemTotal + item.quantity * item.costPrice,
        0
      ),
    0
  );

  const totalProfit = totalRevenue - totalCost;

  const productMap = new Map<
    number,
    {
      productId: number;
      productName: string;
      sku: string;
      unit: string;
      quantitySold: number;
      revenue: number;
      cost: number;
      profit: number;
    }
  >();

  const cashierMap = new Map<
    number,
    {
      userId: number;
      firstName: string;
      lastName: string;
      username: string;
      salesCount: number;
      revenue: number;
    }
  >();

  for (const sale of sales) {
    const existingCashier = cashierMap.get(sale.userId);

    if (existingCashier) {
      existingCashier.salesCount += 1;
      existingCashier.revenue += sale.totalAmount;
    } else {
      cashierMap.set(sale.userId, {
        userId: sale.userId,
        firstName: sale.user.firstName,
        lastName: sale.user.lastName,
        username: sale.user.username,
        salesCount: 1,
        revenue: sale.totalAmount
      });
    }

    for (const item of sale.items) {
      const itemCost = item.quantity * item.costPrice;
      const itemProfit = item.subtotal - itemCost;

      const existingProduct = productMap.get(item.productId);

      if (existingProduct) {
        existingProduct.quantitySold += item.quantity;
        existingProduct.revenue += item.subtotal;
        existingProduct.cost += itemCost;
        existingProduct.profit += itemProfit;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          unit: item.product.unit,
          quantitySold: item.quantity,
          revenue: item.subtotal,
          cost: itemCost,
          profit: itemProfit
        });
      }
    }
  }

  const products = Array.from(productMap.values()).sort(
    (a, b) => b.quantitySold - a.quantitySold
  );

  const cashiers = Array.from(cashierMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    period: {
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null
    },
    summary: {
      totalSales,
      totalRevenue,
      totalCost,
      totalProfit
    },
    products,
    cashiers,
    sales
  };
};

export const getSaleById = async (id: number) => {
  const sale = await prisma.sale.findUnique({
    where: {
      id
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
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return sale;
};