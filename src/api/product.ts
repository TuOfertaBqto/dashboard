import { api } from "./api";
import type { Category } from "./category";

export type Product = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  description: string | null;
  price: number;
  categoryId: Category;
};
export type CreateProduct = {
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
};

export const ProductApi = {
  getAll: async (): Promise<Product[]> => {
    try {
      const res = await api.get("/product");
      return res.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const res = await api.get(`/product/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return {} as Product;
    }
  },

  create: async (data: CreateProduct): Promise<Product> => {
    try {
      const res = await api.post("/product", data);
      return res.data;
    } catch (error) {
      console.error("Error creating product:", error);
      return {} as Product;
    }
  },

  update: async (id: string, data: CreateProduct) => {
    try {
      const res = await api.patch(`/product/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating product:", error);
      return {} as Product;
    }
  },

  remove: async (id: string) => {
    try {
      const res = await api.delete(`/product/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error removing product:", error);
      return { msg: "error removing product" };
    }
  },
};
