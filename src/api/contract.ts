import { api } from "./api";
import type { User } from "./user";

export type CreateContract = {
  vendorId: string;
  customerId: string;
  requestDate: string;
  startDate?: string;
  endDate?: string;
  installmentAmount: number;
  agreement: "weekly" | "fortnightly";
  totalPrice: number;
};

// TODO: move to product api
export type Product = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  description: string | null;
  price: number;
};

export type Contract = {
  id: string;
  vendorId: User;
  customerId: User;
  code: number;
  requestDate: string;
  startDate: string;
  endDate: string;
  installmentAmount: number;
  agreement: "weekly" | "fortnightly";
  totalPrice: number;
  products: [
    {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      product: Product;
      deliveryDate: Date | null;
      status: "to_buy" | "to_dispatch" | "dispatched";
    }
  ];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const ContractApi = {
  getAll: async (): Promise<Contract[]> => {
    try {
      const res = await api.get("/contract");
      return res.data;
    } catch (error) {
      console.error("Error fetching contract:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Contract> => {
    try {
      const res = await api.get(`/contract/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching contract by ID:", error);
      return {} as Contract;
    }
  },

  create: async (data: CreateContract): Promise<Contract> => {
    try {
      const res = await api.post("/contract", data);
      return res.data;
    } catch (error) {
      console.error("Error creating contract:", error);
      return {} as Contract;
    }
  },

  update: async (id: string, data: CreateContract) => {
    try {
      const res = await api.patch(`/contract/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating contract:", error);
      return {} as Contract;
    }
  },

  remove: async (id: string) => {
    try {
      const res = await api.delete(`/contract/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error removing contract:", error);
      return { msg: "error removing contract" };
    }
  },
};
