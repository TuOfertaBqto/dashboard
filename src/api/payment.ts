import { api } from "./api";

export type Payment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  type:
    | "binance"
    | "paypal"
    | "zelle"
    | "mobile_payment"
    | "bank_transfer"
    | "cash"
    | "discount"
    | "payment_agreement"
    | null;
  referenceNumber?: number;
  photo?: string | null;
  owner: string;
  amount: string;
  paidAt: string;
};

export type CreatePayment = {
  type:
    | "binance"
    | "paypal"
    | "zelle"
    | "mobile_payment"
    | "bank_transfer"
    | "cash"
    | "discount"
    | null;
  referenceNumber?: number | string;
  photo?: string | null;
  owner: string;
  amount: number;
  paidAt: string;
};

export const PaymentApi = {
  create: async (id: string, data: CreatePayment): Promise<Payment> => {
    try {
      const res = await api.post("/payment", data, { params: { id } });
      return res.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      return {} as Payment;
    }
  },
};
