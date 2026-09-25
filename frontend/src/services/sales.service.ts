import { apiRequest } from "./api";

export interface SaleProduct {
  id: number;
  name: string;
  sku: string;
  brand: string | null;
  unit: string;
}

export interface SaleItem {
  id: number;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
  saleId: number;
  productId: number;
  product: SaleProduct;
}

export interface SaleUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "ADMIN" | "CASHIER";
}

export interface Sale {
  id: number;
  totalAmount: number;
  reference: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: SaleUser;
  items: SaleItem[];
}

export interface CreateSaleItem {
  productId: number;
  quantity: number;
}

export interface CreateSaleData {
  items: CreateSaleItem[];
}

export const getSales = async (): Promise<Sale[]> => {
  return apiRequest<Sale[]>("/sales");
};

export const createSale = async (
  data: CreateSaleData
): Promise<Sale> => {
  return apiRequest<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
};