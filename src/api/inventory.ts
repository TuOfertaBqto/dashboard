import { api } from "./api";
import type { Product } from "./product";

export type Inventory = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  product: Product;
  stockQuantity: number;
};

export const InventoryApi = {
  getAll: async (): Promise<Inventory[]> => {
    try {
      const res = await api.get("/inventory");
      return res.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }
  },

  getStockByProductId: async (productId: string): Promise<number> => {
    try {
      const res = await api.get(`/inventory/stock/${productId}`);
      return res.data.stock;
    } catch (error) {
      console.error("Error fetching stock by product ID:", error);
      return 0;
    }
  },
};
