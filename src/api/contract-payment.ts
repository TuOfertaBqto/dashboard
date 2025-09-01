import { api } from "./api";
import type { Contract } from "./contract";

export type ContractPayment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  contract: Contract;
  paymentMethod:
    | "binance"
    | "paypal"
    | "zelle"
    | "mobile_payment"
    | "bank_transfer"
    | "cash"
    | "discount"
    | null;
  referenceNumber: null;
  photo: null;
  owner: null;
  dueDate: string;
  installmentAmount: number;
  amountPaid: null;
  paidAt?: string;
  debt?: string;
};

type ProductPaymentDTO = {
  price: number;
  installmentAmount: number;
  quantity: number;
};

export type CreateContractPayment = {
  contractId: string;
  startContract: string;
  agreementContract: "weekly" | "fortnightly";
  products: ProductPaymentDTO[];
};

export type UpdateContractPayment = {
  contract?: string;

  paymentMethod:
    | "binance"
    | "paypal"
    | "zelle"
    | "mobile_payment"
    | "bank_transfer"
    | "cash";

  referenceNumber?: number | string;

  photo?: string | null;

  owner?: string;

  amountPaid: number | string;

  paidAt: string;
};

type ContractDebt = {
  contractId: string;
  contractCode: string;
  overdueInstallments: number;
  overdueAmount: number;
  overdueNumbers: number[];
};

type CustomerWithDebt = {
  customerId: string;
  customerName: string;
  contracts: ContractDebt[];
};
export type VendorsWithDebts = {
  vendorId: string;
  code: string;
  vendorName: string;
  customers: CustomerWithDebt[];
};

type GlobalPaymentsTotals = {
  totalAmountPaid: number;
  totalOverdueDebt: number;
  totalPendingBalance: number;
  totalDebt: number;
};

type VendorPaymentsTotals = GlobalPaymentsTotals & {
  vendorId: string;
  vendorCode: string;
  firstName: string;
  lastName: string;
};

export const ContractPaymentApi = {
  create: async (data: CreateContractPayment): Promise<ContractPayment[]> => {
    try {
      const res = await api.post("/contract-payment", data);
      return res.data;
    } catch (error) {
      console.error("Error creating contract-payment:", error);
      return [] as ContractPayment[];
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

  getOverdueCustomersByVendor: async (): Promise<VendorsWithDebts[]> => {
    try {
      const res = await api.get(
        "/contract-payment/overdue/customers-by-vendor"
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching contract-payment:", error);
      return [];
    }
  },

  canVendorRequest: async (): Promise<boolean> => {
    try {
      const res = await api.get("/contract-payment/vendor/can-request");
      return res.data;
    } catch (error) {
      console.error("Error fetching contract-payment:", error);
      return false;
    }
  },

  getGlobalPaymentsSummary: async (): Promise<GlobalPaymentsTotals> => {
    try {
      const res = await api.get("/contract-payment/payments-summary");
      return res.data;
    } catch (error) {
      console.error("Error fetching payments-summary global:", error);
      return {} as GlobalPaymentsTotals;
    }
  },
  getVendorPaymentsSummary: async (): Promise<VendorPaymentsTotals[]> => {
    try {
      const res = await api.get("/contract-payment/vendor/payments-summary");
      return res.data;
    } catch (error) {
      console.error("Error fetching payments-summary global:", error);
      return [] as VendorPaymentsTotals[];
    }
  },
};
