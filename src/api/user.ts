import { api } from "./api";

export type UserRole = "main" | "super_admin" | "admin" | "vendor" | "customer";

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  code: string | null;
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  phoneNumber: string;
  adress: string;
  role: UserRole;
  documentIdPhoto?: string;
};

export type VendorStats = {
  code: string;
  vendorName: string;
  activeContracts: string;
  pendingContracts: string;
  cancelledContracts: string;
  finishedContracts: string;
};

export const userApi = {
  getAll: async (role?: UserRole): Promise<User[]> => {
    try {
      const res = await api.get("/user", {
        params: role ? { role } : {},
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const res = await api.get(`/user/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return {} as User;
    }
  },

  getProfile: async (id: string): Promise<User> => {
    try {
      const res = await api.get(`/user/profile/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching profile by ID:", error);
      return {} as User;
    }
  },

  create: async (data: Partial<User>): Promise<User> => {
    try {
      const res = await api.post("/user", data);
      return res.data;
    } catch (error) {
      console.error("Error creating user:", error);
      return {} as User;
    }
  },

  update: async (id: string, data: Partial<User>) => {
    try {
      const res = await api.patch(`/user/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating user:", error);
      return {} as User;
    }
  },

  remove: async (id: string) => {
    try {
      const res = await api.delete(`/user/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error removing user:", error);
      return { msg: "error removing user" };
    }
  },

  getVendorStats: async (): Promise<VendorStats[]> => {
    try {
      const res = await api.get("/user/vendor-stats");
      return res.data;
    } catch (error) {
      console.error("error getVendorStats:", error);
      return [];
    }
  },
};
