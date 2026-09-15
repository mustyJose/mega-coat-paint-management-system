import { prisma } from "../config/database.js";

export const getDashboardSummary = async () => {
  const [
    totalProducts,
    totalCategories,
    products,
    totalSales,
    recentSales,
    recentStockMovements
  ] = await Promise.all([
    prisma.product.count({
      where: {
        isActive: true
      }
    }),

    prisma.category.count({
      where: {
        isActive: true
      }
    }),

    prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
        quantity: true,
        reorderLevel: true,
        costPrice: true,
        sellingPrice: true
      }
    }),

    prisma.sale.count(),

    prisma.sale.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
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
    }),

    prisma.stockMovement.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
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
    })
  ]);

  const totalStockQuantity = products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const lowStockProducts = products
    .filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.reorderLevel
    )
    .sort((a, b) => a.quantity - b.quantity);

  const outOfStockProducts = products.filter(
    (product) => product.quantity === 0
  );

  const totalInventoryCost = products.reduce(
    (total, product) =>
      total + product.quantity * product.costPrice,
    0
  );

  const totalInventoryValue = products.reduce(
    (total, product) =>
      total + product.quantity * product.sellingPrice,
    0
  );

  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const todaySales = await prisma.sale.findMany({
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
          costPrice: true,
          subtotal: true
        }
      }
    }
  });

  const todayRevenue = todaySales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const todayCost = todaySales.reduce(
    (total, sale) =>
      total +
      sale.items.reduce(
        (itemTotal, item) =>
          itemTotal + item.quantity * item.costPrice,
        0
      ),
    0
  );

  const todayProfit = todayRevenue - todayCost;

  return {
    summary: {
      totalProducts,
      totalCategories,
      totalStockQuantity,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalSales,
      totalInventoryCost,
      totalInventoryValue
    },

    today: {
      sales: todaySales.length,
      revenue: todayRevenue,
      cost: todayCost,
      profit: todayProfit
    },

    lowStockProducts,

    outOfStockProducts,

    recentSales,

    recentStockMovements
  };
};