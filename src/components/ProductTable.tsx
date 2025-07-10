import type { Product } from "../api/product";

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (p: Product) => void;
}

export const ProductTable = ({ products, onEdit, onDelete }: Props) => {
  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Precio</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-400">
                No hay productos registrados.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-3">{product.name}</td>
                <td className="p-3">${product.price}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
