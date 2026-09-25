import { apiRequest } from "./api";

export interface SalesReportPeriod {
  startDate: string | null;
  endDate: string | null;
}

export interface SalesReportSummary {
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export interface SalesReportProduct {
  productId: number;
  productName: string;
  sku: string;
  unit: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface SalesReportCashier {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  salesCount: number;
  revenue: number;
}

export interface SalesReportSaleItem {
  id: number;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
  saleId: number;
  productId: number;
  product: {
    id: number;
    name: string;
    sku: string;
    unit: string;
  };
}

export interface SalesReportSale {
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
    role: "ADMIN" | "CASHIER";
  };
  items: SalesReportSaleItem[];
}

export interface SalesReportResponse {
  period: SalesReportPeriod;
  summary: SalesReportSummary;
  products: SalesReportProduct[];
  cashiers: SalesReportCashier[];
  sales: SalesReportSale[];
}

export interface SalesReportFilters {
  startDate?: string;
  endDate?: string;
}

export const getSalesReport = async (
  filters: SalesReportFilters = {}
): Promise<SalesReportResponse> => {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const queryString = params.toString();

  return apiRequest<SalesReportResponse>(
    `/sales/report${queryString ? `?${queryString}` : ""}`
  );
};