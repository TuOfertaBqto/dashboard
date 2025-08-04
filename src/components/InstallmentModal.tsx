import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Contract } from "../api/contract";
import type { ContractPayment } from "../api/contract-payment";
import { generateInstallmentsFromContract } from "../utils/generateInstallments";
import { translatePaymentMethod } from "../utils/translations";
import MyPdfDocument from "./MyPdfDocument";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  payments: ContractPayment[];
  contract?: Contract | null;
}

export const InstallmentModal = ({
  open,
  onClose,
  payments,
  contract,
}: Props) => {
  if (!open) return null;
  const effectivePayments =
    payments.length === 0 && contract
      ? generateInstallmentsFromContract(contract)
      : payments;

  const baseInstallmentAmount = contract?.installmentAmount ?? 0;
  const total = contract?.totalPrice ?? 0;
  const numPayments = payments.length || effectivePayments.length;
  let accumulated = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Contenedor del modal */}
      <div className="relative z-10 bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Cuotas del contrato C#{contract?.code}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Encabezado tipo factura */}
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <h3 className="text-sm text-gray-500 font-medium uppercase mb-1">
                  Cliente
                </h3>
                <p className="text-lg font-semibold text-gray-800">
                  {contract?.customerId.firstName}{" "}
                  {contract?.customerId.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Cédula: {contract?.customerId.documentId}
                </p>
              </div>

              {/* Vendedor */}
              <div className="text-left sm:text-right">
                <h3 className="text-sm text-gray-500 font-medium uppercase mb-1">
                  Vendedor
                </h3>
                <p className="text-lg font-semibold text-gray-800">
                  {contract?.vendorId.firstName} {contract?.vendorId.lastName}
                </p>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t my-4" />

            {/* Productos */}
            <div>
              <h3 className="text-sm text-gray-500 font-medium uppercase mb-2">
                Productos
              </h3>
              <ul className="space-y-1 mb-2">
                {contract?.products.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>- {p.product.name}</span>
                    <span className="text-gray-500">x{p.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center pt-2 border-t mt-3">
                <span className="text-sm font-semibold text-gray-700">
                  Total
                </span>
                <span className="text-lg font-bold text-green-600">
                  ${contract?.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className="overflow-x-auto max-h-[50vh] border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left sticky top-0 z-10">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Fecha de vencimiento</th>
                  <th className="p-2">Monto</th>
                  <th className="p-2">Pagado</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Fecha de pago</th>
                  <th className="p-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {effectivePayments.map((p, index) => {
                  let amount = baseInstallmentAmount;

                  if (index === numPayments - 1) {
                    amount = total - accumulated;
                  }

                  accumulated += amount;

                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">
                        {dayjs(p.dueDate.split("T")[0]).format("DD-MM-YYYY")}
                      </td>
                      <td className="p-2">${amount}</td>
                      <td className="p-2">
                        {p.amountPaid ? `$${p.amountPaid}` : "—"}
                      </td>
                      <td className="p-2">
                        {translatePaymentMethod(p.paymentMethod ?? "")}
                      </td>
                      <td className="p-2">
                        {p.paidAt ? p.paidAt.split("T")[0] : "—"}
                      </td>
                      <td className="p-2">{p.debt ? "$" + p.debt : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-end mt-6">
            <div>
              <PDFDownloadLink
                document={
                  <MyPdfDocument
                    name={
                      contract?.customerId.firstName.trim().toUpperCase() ?? ""
                    }
                    lastName={
                      contract?.customerId.lastName.trim().toUpperCase() ?? ""
                    }
                    cedula={contract?.customerId.documentId ?? ""}
                    direccion={contract?.customerId.adress ?? ""}
                    fechaInicio={
                      contract?.startDate?.split("T")[0] ??
                      new Date().toISOString().split("T")[0]
                    }
                    descripcion={
                      contract?.products.map(
                        (p) => `(${p.quantity}) ${p.product.name}`
                      ) || ["Sin productos"]
                    }
                    montoTotal={contract?.totalPrice ?? 0}
                    cuotas={effectivePayments}
                    cantidadProductos={
                      contract?.products.reduce(
                        (total, p) => total + p.quantity,
                        0
                      ) ?? 0
                    }
                    documentIdPhoto={contract?.customerId.documentIdPhoto ?? ""}
                  />
                }
                fileName={`Contrato ${
                  contract?.customerId.firstName.split(" ")[0] +
                  " " +
                  contract?.customerId.lastName.split(" ")[0]
                }.pdf`}
              >
                {({ loading }) => (
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all mr-2 cursor-pointer"
                    disabled={loading}
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {loading ? "Generando PDF..." : "Descargar PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
