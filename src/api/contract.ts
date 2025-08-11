import { api } from "./api";
import type { Product } from "./product";
import type { User } from "./user";

type ContractProduct = {
  productId: string;
  quantity: number;
  status?: "to_buy" | "to_dispatch" | "dispatched";
};

export type CreateContract = {
  vendorId?: string;
  customerId: string;
  requestDate: string;
  startDate?: string | null;
  endDate?: string | null;
  agreement: "weekly" | "fortnightly";
  totalPrice: number;
  status?: "canceled" | "pending" | "approved";
  products: ContractProduct[];
};

export type CreateContractRequest = {
  customerId: string;
  requestDate: string;
  installmentAmount: number;
  agreement: "weekly" | "fortnightly";
  totalPrice: number;
  products: ContractProduct[];
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
  status: "canceled" | "pending" | "approved";
  products: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    product: Product;
    deliveryDate: Date | null;
    status: "to_buy" | "to_dispatch" | "dispatched";
    quantity: number;
  }[];
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

  getRequested: async (): Promise<Contract[]> => {
    try {
      const res = await api.get("/contract/request");
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

  getToDispatchQuantity: async (productId: string): Promise<number> => {
    try {
      const res = await api.get<{ toDispatchQuantity: number }>(
        `/contract-product/to-dispatch/${productId}`
      );
      return res.data.toDispatchQuantity ?? 0;
    } catch (error) {
      console.error("Error fetching to-dispatch quantity:", error);
      return 0;
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

  update: async (id: string, data: Partial<CreateContract>) => {
    try {
      const res = await api.patch(`/contract/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating contract:", error);
      return {} as Contract;
    }
  },

  updateProducts: async (
    id: string,
    status: "to_buy" | "to_dispatch" | "dispatched"
  ) => {
    try {
      const res = await api.patch(`/contract-product/${id}`, { status });
      return res.data;
    } catch (error) {
      console.error("Error updating contract products:", error);
      return { msg: "error updating contract products" };
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
