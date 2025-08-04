import dayjs from "dayjs";
import type { Contract } from "../api/contract";
import { DeleteButton, DispatchButton, EditButton } from "./ActionButtons";

interface Props {
  contracts: Contract[];
  loading: boolean;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onDispatch: (updated: Contract) => void;
  onRowClick?: (contract: Contract) => void;
}

const translateStatus = (status: string): string => {
  switch (status) {
    case "to_buy":
      return "Por comprar";
    case "to_dispatch":
      return "Por despachar";
    case "dispatched":
      return "Despachado";
    default:
      return status;
  }
};

const statusStyles = (status: string): string => {
  switch (status) {
    case "to_buy":
      return "bg-red-100 text-red-800";
    case "to_dispatch":
      return "bg-yellow-100 text-yellow-800";
    case "dispatched":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const ContractTable = ({
  contracts,
  loading,
  onEdit,
  onDelete,
  onDispatch,
  onRowClick,
}: Props) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700 text-left">
          <tr>
            <th className="p-2">Cod</th>
            <th className="p-3">Vendedor</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Producto</th>
            <th className="p-2">Cant.</th>
            <th className="p-3">Status</th>
            <th className="p-2">Precio Total</th>
            <th className="p-2">Fecha despacho</th>
            <th className="p-2">Fecha culminación</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-6 text-gray-400">
                {loading ? "Cargando..." : "No hay contratos registrados."}
              </td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr
                key={contract.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(contract)}
              >
                <td className="p-2">C#{contract.code}</td>
                <td className="p-3 ">
                  T{contract.vendorId.code} {contract.vendorId.firstName}
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
                <td className="p-2">
                  <ul className="space-y-1">
                    {contract.products.map((cp) => (
                      <li
                        key={cp.id}
                        className="px-2 py-1 rounded bg-gray-100 text-sm text-gray-700 w-fit"
                      >
                        <span className="font-medium">{cp.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3">
                  {contract.products.map((cp, index) => (
                    <div
                      key={index}
                      className={`mb-1 px-2 py-1 rounded text-xs font-medium w-fit ${statusStyles(
                        cp.status
                      )}`}
                    >
                      {translateStatus(cp.status)}
                    </div>
                  ))}
                </td>
                <td className="p-2">${contract.totalPrice}</td>
                <td className="p-2">
                  {dayjs(contract.startDate?.split("T")[0]).format(
                    "DD-MM-YYYY"
                  )}
                </td>
                <td className="p-2">
                  {contract.endDate?.split("T")[0]
                    ? dayjs(contract.endDate?.split("T")[0]).format(
                        "DD-MM-YYYY"
                      )
                    : ""}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    {!contract.startDate && (
                      <DispatchButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDispatch({
                            ...contract,
                            startDate: new Date().toISOString(),
                          });
                        }}
                      />
                    )}
                    {!contract.startDate && (
                      <EditButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(contract);
                        }}
                      />
                    )}

                    {!contract.startDate && (
                      <DeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(contract.id);
                        }}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
