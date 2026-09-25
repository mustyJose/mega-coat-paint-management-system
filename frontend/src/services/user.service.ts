import { apiRequest } from "./api";

export type UserRole = "ADMIN" | "CASHIER";

export interface SystemUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserStatusResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getUsers = async (): Promise<SystemUser[]> => {
  return apiRequest<SystemUser[]>("/users");
};

export const createUser = async (
  data: CreateUserData
): Promise<SystemUser> => {
  return apiRequest<SystemUser>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUserStatus = async (
  id: number,
  isActive: boolean
): Promise<UpdateUserStatusResponse> => {
  return apiRequest<UpdateUserStatusResponse>(
    `/users/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }
  );
};