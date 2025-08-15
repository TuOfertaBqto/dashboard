import type { Inventory } from "../api/inventory";
import type { Product } from "../api/product";
import { useAuth } from "../auth/useAuth";
import { DeleteButton, EditButton } from "./ActionButtons";

interface Props {
  inventory: Inventory[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (p: Product) => void;
}

export const ProductTable = ({
  inventory,
  loading,
  onEdit,
  onDelete,
}: Props) => {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Precio</th>
            <th className="p-3 text-left">Cuota semanal</th>
            {user?.role !== "vendor" && (
              <>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Acciones</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-400">
                {loading ? "Cargando..." : "No hay productos registrados."}
              </td>
            </tr>
          ) : (
            inventory.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.product.name}</td>
                <td className="p-3">${i.product.price}</td>
                <td className="p-3">${i.product.installmentAmount}</td>
                {user?.role !== "vendor" && (
                  <>
                    <td className="p-3">{i.stockQuantity}</td>
                    <td className="p-3 space-x-2">
                      <EditButton onClick={() => onEdit(i.product)} />
                      <DeleteButton onClick={() => onDelete(i.product)} />
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
