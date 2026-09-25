import { apiRequest } from "./api";

export interface Category {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  return apiRequest<Category[]>("/categories");
};

export const createCategory = async (
  data: CreateCategoryData
): Promise<Category> => {
  return apiRequest<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCategory = async (
  id: number,
  data: CreateCategoryData
): Promise<Category> => {
  return apiRequest<Category>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deactivateCategory = async (
  id: number
): Promise<Category> => {
  return apiRequest<Category>(`/categories/${id}`, {
    method: "DELETE",
  });
};