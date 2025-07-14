import { api } from "./api";
import type { Contract } from "./contract";

export type ContractPayment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  contract: Contract;
  paymentMethod: null;
  referenceNumber: null;
  photo: null;
  owner: null;
  dueDate: string;
  amountPaid: null;
  paidAt: null;
};

export const ContractPaymentApi = {
  getAll: async (): Promise<ContractPayment[]> => {
    try {
      const res = await api.get("/contract-payment");
      return res.data;
    } catch (error) {
      console.error("Error fetching contract-payment:", error);
      return [];
    }
  },
};
