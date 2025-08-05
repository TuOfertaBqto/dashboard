import { useEffect, useState } from "react";
import { ProductApi, type Product } from "../api/product";
import { useNavigate } from "react-router-dom";
import { ProductTable } from "../components/ProductTable";
import { ConfirmModal } from "../components/ConfirmModal";
import { InventoryApi, type Inventory } from "../api/inventory";
import { InventoryMovApi } from "../api/inventory-movement";
import { useAuth } from "../auth/useAuth";

export const ProductListPage = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await InventoryApi.getAll();
      setInventory(res);
    } catch (err) {
      console.log("Error loading inventory", err);
    } finally {
      setLoading(false);
    }
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
        {user?.role !== "vendor" && (
          <div className="flex gap-2">
            <button
              onClick={() => setOpenInventoryModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
            >
              Ingreso de inventario
            </button>
            <button
              onClick={() => navigate("/products/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              Nuevo producto
            </button>
          </div>
        )}
      </div>

      <ProductTable
        inventory={inventory}
        loading={loading}
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
              <label htmlFor="product" className="block text-sm mb-1">
                Producto
              </label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setFormError("");
                }}
                className="w-full border rounded p-2"
                required
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
              <label htmlFor="quantity" className="block text-sm mb-1">
                Cantidad
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={quantity > 0 ? quantity : ""}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => {
                  const value = e.target.value;
                  const intValue = parseInt(value, 10);

                  if (
                    value === "" ||
                    (!isNaN(intValue) &&
                      intValue >= 1 &&
                      value === intValue.toString())
                  ) {
                    setQuantity(value === "" ? 0 : intValue);
                    setFormError("");
                  }
                }}
                required
              />
            </div>
            {formError && (
              <p className="text-red-600 text-sm mt-2">{formError}</p>
            )}
          </div>
        }
        onCancel={() => {
          setOpenInventoryModal(false);
          setSelectedProductId("");
          setQuantity(0);
        }}
        onConfirm={async () => {
          if (!selectedProductId) {
            setFormError("Debe seleccionar un producto.");
            return;
          }

          if (quantity <= 0) {
            setFormError("Debe seleccionar una cantidad válida.");
            return;
          }

          setFormError("");
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
