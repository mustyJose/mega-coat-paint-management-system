import { apiRequest } from "./api";

export interface ProductCategory {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
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
  category: ProductCategory;
}

export interface CreateProductData {
  name: string;
  sku: string;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  categoryId: number;
}

export const getProducts = async (): Promise<Product[]> => {
  return apiRequest<Product[]>("/products");
};

export const getProductById = async (
  id: number
): Promise<Product> => {
  return apiRequest<Product>(`/products/${id}`);
};

export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  return apiRequest<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
};