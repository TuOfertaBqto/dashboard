import { api } from "./api";

export type Account = {
  id: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
};

export const AccountApi = {
  getAll: async (): Promise<Account[]> => {
    try {
      const res = await api.get("/account");
      return res.data;
    } catch (error) {
      console.error("Error fetching account:", error);
      return [];
    }
  },
};
