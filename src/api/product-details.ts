import { api } from "./api";

export type CreateProductDetails = {
  items: [
    {
      cpId: {
        id: string;
      };
      serialNumber: string;
      isNew: boolean;
    },
  ];
};
export type ProductDetails = {
  cpId: {
    id: string;
  };
  serialNumber: string;
  isNew: boolean;
  id: string;
};

export const ProductDetailsApi = {
  create: async (data: CreateProductDetails): Promise<ProductDetails[]> => {
    try {
      const res = await api.post("/product-details", data);
      return res.data;
    } catch (error) {
      console.error("Error creating product-details:", error);
      return [] as ProductDetails[];
    }
  },
};
