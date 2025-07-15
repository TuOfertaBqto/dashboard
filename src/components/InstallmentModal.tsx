import type { ContractPayment } from "../api/contract-payment";

interface Props {
  open: boolean;
  onClose: () => void;
  payments: ContractPayment[];
  contractCode?: number;
}

export const InstallmentModal = ({
  open,
  onClose,
  payments,
  contractCode,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Contenedor del modal */}
      <div className="relative z-10 bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Cuotas del contrato C#{contractCode}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full table-auto text-sm border rounded">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Fecha de vencimiento</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Pagado</th>
                <th className="p-2">Fecha de pago</th>
                <th className="p-2">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, index) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{p.dueDate.split("T")[0]}</td>
                  <td className="p-2">${p.contract.installmentAmount}</td>
                  <td className="p-2">
                    {p.amountPaid ? `$${p.amountPaid}` : "—"}
                  </td>
                  <td className="p-2">
                    {p.paidAt ? p.paidAt.split("T")[0] : "—"}
                  </td>
                  <td className="p-2">{p.debt ? "$" + p.debt : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
