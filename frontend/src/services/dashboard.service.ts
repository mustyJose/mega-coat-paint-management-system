import { apiRequest } from "./api";

export interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalStockQuantity: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalSales: number;
  totalInventoryCost: number;
  totalInventoryValue: number;
}

export interface DashboardToday {
  sales: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface DashboardProduct {
  id: number;
  name: string;
  sku: string;
  brand: string | null;
  unit: string;
  quantity: number;
  reorderLevel: number;
  sellingPrice: number;
}

export interface DashboardSaleItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface DashboardSale {
  id: number;
  totalAmount: number;
  reference: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  items: DashboardSaleItem[];
}

export interface DashboardStockMovement {
  id: number;
  type:
    | "PURCHASE"
    | "SALE"
    | "ADJUSTMENT_IN"
    | "ADJUSTMENT_OUT"
    | "DAMAGE"
    | "RETURN";
  quantity: number;
  reference: string | null;
  note: string | null;
  productId: number;
  userId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    sku: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface DashboardResponse {
  summary: DashboardSummary;
  today: DashboardToday;
  lowStockProducts: DashboardProduct[];
  outOfStockProducts: DashboardProduct[];
  recentSales: DashboardSale[];
  recentStockMovements: DashboardStockMovement[];
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  return apiRequest<DashboardResponse>("/dashboard");
};