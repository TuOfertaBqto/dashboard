import { api } from "./api";

export const InventoryApi = {
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
