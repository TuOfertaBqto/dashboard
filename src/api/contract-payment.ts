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
  paidAt?: string;
  debt?: string;
};

export type CreateContractPayment = {
  contractId: string;
  startContract: string;
  installmentAmountContract: number;
  agreementContract: "weekly" | "fortnightly";
  totalPriceContract: number;
};

export type UpdateContractPayment = {
  contract?: string;

  paymentMethod: "zelle" | "mobile_payment" | "bank_transfer" | "cash";

  referenceNumber: number;

  photo?: string | null;

  owner?: string;

  amountPaid: number;

  paidAt: string;
};

export const ContractPaymentApi = {
  create: async (data: CreateContractPayment): Promise<ContractPayment> => {
    try {
      const res = await api.post("/contract-payment", data);
      return res.data;
    } catch (error) {
      console.error("Error creating contract-payment:", error);
      return {} as ContractPayment;
    }
  },

  getAll: async (): Promise<ContractPayment[]> => {
    try {
      const res = await api.get("/contract-payment");
      return res.data;
    } catch (error) {
      console.error("Error fetching contract-payment:", error);
      return [];
    }
  },

  getAllByContractId: async (id: string): Promise<ContractPayment[]> => {
    try {
      const res = await api.get(`/contract-payment/contract/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching contract-payment by ContractId:", error);
      return [] as ContractPayment[];
    }
  },

  getById: async (id: string): Promise<ContractPayment> => {
    try {
      const res = await api.get(`/contract-payment/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching contract-payment by ID:", error);
      return {} as ContractPayment;
    }
  },

  update: async (id: string, data: UpdateContractPayment) => {
    try {
      const res = await api.patch(`/contract-payment/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating contract-payment:", error);
      return {};
    }
  },
};
