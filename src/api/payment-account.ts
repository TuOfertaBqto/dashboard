import { api } from "./api";

export type TotalsByAccount = {
  accountId: number;
  owner: string;
  totalMobile: number;
  totalTransfer: number;
  countMobile: number;
  countTransfer: number;
};

export const PaymentAccountApi = {
  getTotalsByAccount: async (
    start: string,
    end: string
  ): Promise<TotalsByAccount[]> => {
    try {
      const res = await api.get("/payment-account/totals-by-account", {
        params: { start, end },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching payment-account totals by account:", error);
      return [];
    }
  },
};
