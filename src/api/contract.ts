import { api } from "./api";
import type { ContractProduct } from "./contract-product";
import type { User } from "./user";

export type CreateContractProduct = {
  id?: string;
  productId: string;
  quantity: number;
  status: "to_buy" | "to_dispatch" | "dispatched";
  price: number;
  installmentAmount: number;
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
  products: CreateContractProduct[];
};

export type CreateContractRequest = {
  customerId: string;
  requestDate: string;
  installmentAmount: number;
  agreement: "weekly" | "fortnightly";
  totalPrice: number;
  products: CreateContractProduct[];
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
  products: ContractProduct[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ResponseCountContract = {
  activeContracts: number;
  pendingToDispatch: number;
  canceledContracts: number;
  completedContracts: number;
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

  countContractsByVendor: async (
    id: string
  ): Promise<ResponseCountContract> => {
    try {
      const res = await api.get(`/contract/vendor/count/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching count contract by ID", error);
      return {} as ResponseCountContract;
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

  update: async (
    id: string,
    data: Partial<CreateContract>
  ): Promise<Contract> => {
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

  getCount: async (): Promise<ResponseCountContract> => {
    try {
      const res = await api.get("/contract/count");
      return res.data;
    } catch (error) {
      console.error("error counting contracts:", error);
      return {} as ResponseCountContract;
    }
  },
};
