import type { Contract } from "../api/contract";

interface Props {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

export const ContractTable = ({ contracts, onEdit, onDelete }: Props) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700 text-left">
          <tr>
            <th className="p-3">Cod</th>
            <th className="p-3">Vendedor</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Fecha Solicitud</th>
            <th className="p-3">Fecha Despacho</th>
            <th className="p-3">Fecha Finalización</th>
            <th className="p-3">Precio de venta</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-400">
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
                <td className="p-3">{contract.customerId.firstName}</td>
                <td className="p-3">{contract.requestDate.split("T")[0]}</td>
                <td className="p-3">{contract.startDate?.split("T")[0]}</td>
                <td className="p-3">{contract.endDate?.split("T")[0]}</td>
                <td className="p-3">{contract.totalPrice}</td>
                <td className="p-3 space-x-2">
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
