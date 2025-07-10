import type { Contract } from "../api/contract";

interface Props {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onDispatch: (updated: Contract) => void;
}

export const ContractTable = ({
  contracts,
  onEdit,
  onDelete,
  onDispatch,
}: Props) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700 text-left">
          <tr>
            <th className="p-3">Cod</th>
            <th className="p-3">Vendedor</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Producto</th>
            <th className="p-3">Status</th>
            <th className="p-3">Precio Total</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-400">
                No hay contratos registrados.
              </td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr key={contract.id} className="border-t">
                <td className="p-3">C#{contract.code}</td>
                <td className="p-3 ">
                  C{contract.vendorId.code} {contract.vendorId.firstName}
                </td>
                <td className="p-3">
                  {contract.customerId.firstName} {contract.customerId.lastName}
                </td>
                <td className="p-3">
                  <ul className="list-disc list-inside space-y-1">
                    {contract.products.map((cp) => (
                      <li key={cp.id}>{cp.product.name}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-3">
                  {contract.products.map((cp, index) => (
                    <span key={index}>
                      {cp.status}
                      {index < contract.products.length - 1 && <br />}
                    </span>
                  ))}
                </td>
                <td className="p-3">{contract.totalPrice}</td>
                <td className="p-3 space-x-2">
                  {!contract.startDate && (
                    <button
                      onClick={() =>
                        onDispatch({
                          ...contract,
                          startDate: new Date().toISOString(),
                        })
                      }
                      className="text-green-600 hover:underline text-sm"
                    >
                      Despachar
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(contract)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(contract.id)}
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
