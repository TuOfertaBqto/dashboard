import { api } from "./api";
import type { Contract } from "./contract";
import type { Payment } from "./payment";

type InstallmentPayment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  payment: Payment;
  amount: string;
};

export type Installment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  contract: Contract;
  dueDate: string;
  installmentAmount: number;
  paidAt?: string;
  debt?: string;
  installmentPayments: InstallmentPayment[];
};

type ProductPaymentDTO = {
  price: number;
  installmentAmount: number;
  quantity: number;
};

export type CreateInstallment = {
  contractId: string;
  startContract: string;
  agreementContract: "weekly" | "fortnightly";
  products: ProductPaymentDTO[];
};

export type UpdateInstallment = {
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

  owner: string;

  amountPaid: number | string;

  paidAt: string;
};

type ContractDebt = {
  contractId: string;
  contractCode: string;
  overdueInstallments: number;
  overdueAmount: number;
  overdueNumbers: number[];
  products: { productId: string; productName: string; quantity: number }[];
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

export type GlobalPaymentsTotals = {
  totalAmountPaid: number;
  totalOverdueDebt: number;
  totalPendingBalance: number;
  totalDebt: number;
};

export type VendorPaymentsTotals = GlobalPaymentsTotals & {
  vendorId: string;
  vendorCode: string;
  firstName: string;
  lastName: string;
};

export const InstallmentApi = {
  create: async (data: CreateInstallment): Promise<Installment[]> => {
    try {
      const res = await api.post("/installment", data);
      return res.data;
    } catch (error) {
      console.error("Error creating installment:", error);
      return [] as Installment[];
    }
  },

  getAllByVendor: async (vendorId: string): Promise<Installment[]> => {
    try {
      const res = await api.get(`/installment/vendor/${vendorId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching installment:", error);
      return [];
    }
  },

  getAllByContractId: async (id: string): Promise<Installment[]> => {
    try {
      const res = await api.get(`/installment/contract/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching installment by ContractId:", error);
      return [] as Installment[];
    }
  },

  getById: async (id: string): Promise<Installment> => {
    try {
      const res = await api.get(`/installment/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching installment by ID:", error);
      throw error;
    }
  },

  getOverdueCustomersByVendor: async (): Promise<VendorsWithDebts[]> => {
    try {
      const res = await api.get("/installment/overdue/customers-by-vendor");
      return res.data;
    } catch (error) {
      console.error("Error fetching installment:", error);
      return [];
    }
  },

  canVendorRequest: async (): Promise<boolean> => {
    try {
      const res = await api.get("/installment/vendor/can-request");
      return res.data;
    } catch (error) {
      console.error("Error fetching installment:", error);
      return false;
    }
  },

  getGlobalPaymentsSummary: async (): Promise<GlobalPaymentsTotals> => {
    try {
      const res = await api.get("/installment/payments-summary");
      return res.data;
    } catch (error) {
      console.error("Error fetching payments-summary global:", error);
      return {} as GlobalPaymentsTotals;
    }
  },

  getVendorPaymentsSummary: async (): Promise<VendorPaymentsTotals[]> => {
    try {
      const res = await api.get("/installment/vendor/payments-summary");
      return res.data;
    } catch (error) {
      console.error("Error fetching payments-summary global:", error);
      return [] as VendorPaymentsTotals[];
    }
  },

  getOneVendorPaymentsSummary: async (
    id: string
  ): Promise<VendorPaymentsTotals> => {
    try {
      const res = await api.get(`installment/vendor/${id}/payments-summary`);
      return res.data;
    } catch (error) {
      console.error("Error fetching payments-summary by vendor:", error);
      return {} as VendorPaymentsTotals;
    }
  },

  getOverdueCustomersByOneVendor: async (
    id: string
  ): Promise<VendorsWithDebts> => {
    try {
      const res = await api.get(
        `installment/overdue/${id}/customers-by-vendor`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching overdue by vendor", error);
      return {} as VendorsWithDebts;
    }
  },
};
