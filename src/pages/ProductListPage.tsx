import { useEffect, useState } from "react";
import { ProductApi, type Product } from "../api/product";
import { useNavigate } from "react-router-dom";
import { ProductTable } from "../components/ProductTable";
import { ConfirmModal } from "../components/ConfirmModal";
import { InventoryApi, type Inventory } from "../api/inventory";
import { InventoryMovApi } from "../api/inventory-movement";

export const ProductListPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await InventoryApi.getAll();
    setInventory(res);
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
        <div className="flex gap-2">
          <button
            onClick={() => setOpenInventoryModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Ingreso de inventario
          </button>
          <button
            onClick={() => navigate("/products/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nuevo producto
          </button>
        </div>
      </div>

      <ProductTable
        inventory={inventory}
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

      <ConfirmModal
        open={openInventoryModal}
        title="Ingreso de inventario"
        message={
          <div className="space-y-4 pb-5">
            <div>
              <label className="block text-sm mb-1">Producto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Seleccione un producto</option>
                {inventory.map((inv) => (
                  <option key={inv.product.id} value={inv.product.id}>
                    {inv.product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border rounded p-2"
                placeholder="Ej: 10"
              />
            </div>
          </div>
        }
        onCancel={() => {
          setOpenInventoryModal(false);
          setSelectedProductId("");
          setQuantity(0);
        }}
        onConfirm={async () => {
          try {
            if (!selectedProductId || quantity <= 0) return;
            await InventoryMovApi.create({
              productId: selectedProductId,
              quantity,
              type: "in",
            });
            fetchProducts();
          } catch (err) {
            console.error("Error al ingresar inventario:", err);
          } finally {
            setOpenInventoryModal(false);
            setSelectedProductId("");
            setQuantity(0);
          }
        }}
      />
    </div>
  );
};
