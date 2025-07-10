import { api } from "./api";

export type Category = {
  id: string;
  name: string;
};
export type CreateCategory = {
  name: string;
};

export const CategoryApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      const res = await api.get("/category");
      return res.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Category> => {
    try {
      const res = await api.get(`/category/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return {} as Category;
    }
  },

  create: async (data: CreateCategory): Promise<Category> => {
    try {
      const res = await api.post("/category", data);
      return res.data;
    } catch (error) {
      console.error("Error creating category:", error);
      return {} as Category;
    }
  },

  update: async (id: string, data: CreateCategory) => {
    try {
      const res = await api.patch(`/category/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating category:", error);
      return {} as Category;
    }
  },

  remove: async (id: string) => {
    try {
      const res = await api.delete(`/category/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error removing category:", error);
      return { msg: "error removing category" };
    }
  },
};
