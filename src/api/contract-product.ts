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
  price: number;
  installmentAmount: number;
};

type UpdateContractProducts = {
  id?: string;
  contractId?: string;
  productId?: string;
  quantity?: number;
  deliveryDate?: Date;
  status?: "to_buy" | "to_dispatch" | "dispatched";
  price?: number;
  installmentAmount?: number;
};

type ProductDispatchedTotals = {
  productId: string;
  productName: string;
  totalDispatched: string;
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

  getDispatchedTotals: async (
    page = 1,
    limit = 10
  ): Promise<{ data: ProductDispatchedTotals[]; total: number }> => {
    try {
      const res = await api.get("/contract-product/dispatched", {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching getDispatchedTotals:", error);
      return { data: [], total: 0 };
    }
  },

  getVendorEarnings: async (vendorId: string): Promise<{ total: number }> => {
    try {
      const res = await api.get(
        `/contract-product/vendor/${vendorId}/earnings`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching getVendorEarnings:", error);
      return {} as { total: number };
    }
  },

  updateBulk: async (updateBulk: UpdateContractProducts[]) => {
    try {
      const res = await api.patch(`/contract-product`, updateBulk);
      return res.data;
    } catch (error) {
      console.error("Error fetching update contract products:", error);
    }
  },

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

  remove: async (id: string) => {
    try {
      const res = await api.delete(`/contract-product/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error removing contract product:", error);
      return { msg: "error removing contract product" };
    }
  },
};
