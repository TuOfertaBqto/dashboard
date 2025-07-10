import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductApi, type CreateProduct, type Product } from "../api/product";
import { ProductForm } from "../components/ProductForm";

export const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Product | null>(null);

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
      />
    </div>
  );
};
