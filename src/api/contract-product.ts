import { api } from "./api";
import type { Product } from "./product";

export type ContractProduct = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  product: Product;
  deliveryDate: Date | null;
  status: "to_buy" | "to_dispatch" | "dispatched";
  quantity: number;
};

export const ContractProductApi = {
  getToDispatchQuantity: async (productId: string): Promise<number> => {
    try {
      const res = await api.get<{ toDispatchQuantity: number }>(
        `/contract-product/to-dispatch/${productId}`
      );
      return res.data.toDispatchQuantity ?? 0;
    } catch (error) {
      console.error("Error fetching to-dispatch quantity:", error);
      return 0;
    }
  },

  updateBulk: async () => {},

  updateProducts: async (
    id: string,
    status: "to_buy" | "to_dispatch" | "dispatched"
  ) => {
    try {
      const res = await api.patch(`/contract-product/${id}`, { status });
      return res.data;
    } catch (error) {
      console.error("Error updating contract products:", error);
      return { msg: "error updating contract products" };
    }
  },
};
