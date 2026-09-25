import { apiRequest } from "./api";

export type StockMovementType =
  | "PURCHASE"
  | "SALE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "DAMAGE"
  | "RETURN";

export interface StockMovement {
  id: number;
  type: StockMovementType;
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
    unit: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: "ADMIN" | "CASHIER";
  };
}

export interface StockAdjustmentInput {
  productId: number;
  quantity: number;
  type:
    | "PURCHASE"
    | "ADJUSTMENT_IN"
    | "ADJUSTMENT_OUT"
    | "DAMAGE"
    | "RETURN";
  reference?: string;
  note?: string;
}

export interface StockAdjustmentResponse {
  product: {
    id: number;
    name: string;
    sku: string;
    brand: string | null;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
    reorderLevel: number;
    isActive: boolean;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
    category: {
      id: number;
      name: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  movement: StockMovement;
}

export const getStockMovements = async (): Promise<
  StockMovement[]
> => {
  return apiRequest<StockMovement[]>(
    "/inventory/movements"
  );
};

export const createStockAdjustment = async (
  input: StockAdjustmentInput
): Promise<StockAdjustmentResponse> => {
  return apiRequest<StockAdjustmentResponse>(
    "/inventory/adjustments",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
};