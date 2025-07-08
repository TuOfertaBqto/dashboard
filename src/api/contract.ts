import { api } from "./api";

export type Contract = {
  id: string;
  vendor_id: string;
  customer_id: string;
  code: number;
  request_date: string;
  start_date: string;
  end_date: string;
  installment_amount: number;
  agreement: "weekly" | "fortnightly";
  total_price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
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

  create: async (data: Partial<Contract>): Promise<Contract> => {
    try {
      const res = await api.post("/contract", data);
      return res.data;
    } catch (error) {
      console.error("Error creating contract:", error);
      return {} as Contract;
    }
  },

  update: async (id: string, data: Partial<Contract>) => {
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
