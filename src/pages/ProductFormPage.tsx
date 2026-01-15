import { useEffect, useState } from "react";
import { ProductForm } from "../components/ProductForm";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryApi, type Category } from "../api/category";
import { ProductApi, type CreateProduct, type Product } from "../api/product";

export const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    CategoryApi.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    if (id) {
      ProductApi.getById(id)
        .then((product) => setInitialData(product))
        .catch(() => navigate("/products"));
    }
  }, [id, navigate]);

  const handleSubmit = async (data: CreateProduct) => {
    try {
      if (id) {
        await ProductApi.update(id, data);
      } else {
        await ProductApi.create(data);
      }
      navigate("/products");
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        {id ? "Editar producto" : "Nuevo producto"}
      </h1>
      <ProductForm
        initialData={initialData ?? undefined}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </div>
  );
};
