import { api } from "./api";

type CreateInventoryMov = {
  productId: string;
  quantity: number;
  type: "in" | "out";
};

export const InventoryMovApi = {
  create: async (data: CreateInventoryMov) => {
    try {
      const res = await api.post("/inventory-movement", data);
      return res.data;
    } catch (error) {
      console.error("Error inventory-movement:", error);
      return {};
    }
  },
};
