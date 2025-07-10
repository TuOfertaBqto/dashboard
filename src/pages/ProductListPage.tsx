import { useEffect, useState } from "react";
import { ProductApi, type Product } from "../api/product";
import { useNavigate } from "react-router-dom";
import { ProductTable } from "../components/ProductTable";
import { ConfirmModal } from "../components/ConfirmModal";

export const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await ProductApi.getAll();
    setProducts(res);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await ProductApi.remove(productToDelete.id);
      fetchProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    } finally {
      setProductToDelete(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Productos</h1>
        <button
          onClick={() => navigate("/products/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo producto
        </button>
      </div>

      <ProductTable
        products={products}
        onEdit={(p) => navigate(`/products/${p.id}/edit`)}
        onDelete={(product) => setProductToDelete(product)}
      />

      <ConfirmModal
        open={!!productToDelete}
        title="Eliminar producto"
        message={`¿Estás seguro que deseas eliminar "${productToDelete?.name}"?`}
        onCancel={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
