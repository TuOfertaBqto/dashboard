import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Contract } from "../api/contract";
import { InstallmentApi, type Installment } from "../api/installment";
import { generateInstallmentsFromContract } from "../utils/generateInstallments";
import { translatePaymentMethod } from "../utils/translations";
import MyPdfDocument from "./pdf/MyPdfDocument";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "./ConfirmModal";

interface Props {
  open: boolean;
  isRequest: boolean;
  onClose: () => void;
  contract?: Contract;
}

export const InstallmentModal = ({
  open,
  isRequest,
  onClose,
  contract,
}: Props) => {
  const [payments, setPayments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePayments, setEditablePayments] = useState<Installment[]>([]);
  const [installmentToDelete, setInstallmentToDelete] = useState<{
    id: string;
    index: number;
  } | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  useEffect(() => {
    if (!contract?.id || !open) {
      setPayments([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchInstallments = async () => {
      setLoading(true);
      setPayments([]); // 🔹 evita mostrar cuotas del contrato anterior

      try {
        const res = await InstallmentApi.getAllByContractId(contract.id);

        if (!isMounted) return;

        if (res && res.length > 0) {
          setPayments(res);
          setEditablePayments(res);
        } else {
          const generated = generateInstallmentsFromContract(contract);
          setPayments(generated);
          setEditablePayments(generated);
        }
      } catch (err) {
        console.error("Error al obtener cuotas:", err);
        if (isMounted) {
          setPayments(generateInstallmentsFromContract(contract));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInstallments();

    return () => {
      isMounted = false;
    };
  }, [contract, open]);

  const handleChange = (
    index: number,
    field: "dueDate" | "installmentAmount",
    value: string,
  ) => {
    const updated = [...editablePayments];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setEditablePayments(updated);
  };

  const handleSave = async () => {
    for (const p of editablePayments) {
      if (!p.installmentAmount || p.installmentAmount <= 0) {
        toast.info("Todos los montos deben ser mayores a 0");
        return;
      }
    }
    try {
      const payload = editablePayments.map((p) => ({
        id: p.id,
        dueDate: p.dueDate,
        installmentAmount: parseInt(String(p.installmentAmount), 10),
      }));

      await InstallmentApi.updateMany(payload);

      const sortedPayments = [...editablePayments].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );

      setPayments(sortedPayments);
      setEditablePayments(sortedPayments);
      setIsEditing(false);
    } catch (err) {
      console.error("Error al actualizar cuotas", err);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const InstallmentSkeletonRow = () => (
    <tr className="border-t animate-pulse">
      {/* # */}
      <td className="p-2">
        <div className="h-3 bg-gray-200 rounded w-5" />
      </td>

      {/* Vencimiento */}
      <td className="p-2">
        <div className="h-5 bg-gray-200 rounded-full w-24 sm:w-32" />
      </td>

      {/* Monto */}
      <td className="p-2">
        <div className="h-3 bg-gray-200 rounded w-16 sm:w-20" />
      </td>

      {/* Pagado */}
      <td className="p-2">
        <div className="h-3 bg-gray-200 rounded w-14 sm:w-20" />
      </td>

      {/* Tipo (solo md+) */}
      <td className="p-2 hidden md:table-cell">
        <div className="h-3 bg-gray-200 rounded w-20 lg:w-24" />
      </td>

      {/* Fecha de pago */}
      <td className="p-2">
        <div className="h-3 bg-gray-200 rounded w-20 sm:w-24" />
      </td>

      {/* Saldo */}
      <td className="p-2">
        <div className="h-3 bg-gray-200 rounded w-12 sm:w-16" />
      </td>
    </tr>
  );

  const handleAskRemoveInstallment = (id: string, index: number) => {
    setInstallmentToDelete({ id, index });
    setOpenDeleteModal(true);
  };

  const handleRemoveInstallment = async () => {
    if (!installmentToDelete) return;

    const ok = await InstallmentApi.remove(installmentToDelete.id);

    if (!ok) {
      toast.error("Error eliminando la cuota");
      return;
    }

    const updated = [...editablePayments];
    updated.splice(installmentToDelete.index, 1);
    setEditablePayments(updated);
    setPayments(updated);

    toast.success("Cuota eliminada");

    setOpenDeleteModal(false);
    setInstallmentToDelete(null);
  };

  if (!open || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Contenedor del modal */}
      <div className="relative z-10 bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto py-4">
        <div className="p-3 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Cuotas del contrato C#{contract?.code}
            </h2>
            <button
              onClick={handleClose}
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
                  ${contract?.totalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de pagos */}
          <div
            className="border rounded 
    max-h-screen 
    md:max-h-[70vh] 
    lg:max-h-[80vh] 
    min-h-fit 
    w-full overflow-hidden"
          >
            <table className="w-full table-fixed text-[10px] sm:text-xs md:text-sm lg:text-base">
              <thead className="bg-gray-100 text-left sticky top-0 z-10">
                <tr>
                  <th className="p-2 w-[5%]">#</th>
                  <th className="p-2 w-[30%] md:w-[20%]">Vencimiento</th>
                  <th className="p-2 w-[12%]">Monto</th>
                  <th className="p-2 w-[13%]">Pagado</th>
                  <th className="p-2 hidden md:table-cell md:w-[15%]">Tipo</th>
                  <th className="p-2 w-[20%]">Fecha de pago</th>
                  <th className="p-2 w-[15%]">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(10)].map((_, i) => (
                      <InstallmentSkeletonRow key={i} />
                    ))
                  : (isEditing ? editablePayments : payments).map(
                      (p, index) => {
                        let dueDateClass = "";
                        let IconComponent = null;
                        let number = "";

                        if (
                          ["discount", "payment_agreement"].includes(
                            p.installmentPayments[0]?.payment.type ?? "",
                          )
                        ) {
                          dueDateClass = "bg-blue-100 text-blue-700";
                          IconComponent = InformationCircleIcon;
                        } else if (p.paidAt) {
                          dueDateClass = "bg-green-100 text-green-700";
                          IconComponent = CheckCircleIcon;
                        } else if (
                          dayjs(p.dueDate.split("T")[0]).isBefore(
                            dayjs(),
                            "day",
                          )
                        ) {
                          dueDateClass = "bg-red-100 text-red-700";
                          IconComponent = ExclamationCircleIcon;
                        } else {
                          dueDateClass = "bg-yellow-100 text-yellow-800";
                          IconComponent = ClockIcon;
                        }

                        if (
                          payments[0] &&
                          payments[1] &&
                          payments[0].installmentAmount >
                            payments[1].installmentAmount
                        ) {
                          if (index === 0) {
                            number = "Inicial";
                          } else {
                            number = index.toString();
                          }
                        } else {
                          number = (index + 1).toString();
                        }

                        return (
                          <tr key={p.id} className="border-t">
                            <td className="p-2">{number}</td>
                            <td className="p-2">
                              <span
                                className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold 
      ${dueDateClass} 
      max-w-full 
    `}
                              >
                                {IconComponent && (
                                  <IconComponent className="w-4 h-4 shrink-0" />
                                )}
                                <span className="truncate">
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      value={p.dueDate.split("T")[0]}
                                      onChange={(e) =>
                                        handleChange(
                                          index,
                                          "dueDate",
                                          e.target.value,
                                        )
                                      }
                                      className="border rounded py-0.5 text-xs w-full"
                                    />
                                  ) : (
                                    dayjs(p.dueDate.split("T")[0]).format(
                                      "DD-MM-YYYY",
                                    )
                                  )}
                                </span>
                              </span>
                            </td>
                            <td className="p-2">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="1"
                                  min={1}
                                  value={parseInt(
                                    String(p.installmentAmount),
                                    10,
                                  )}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "." || e.key === ",")
                                      e.preventDefault();
                                  }}
                                  onChange={(e) => {
                                    const val = e.target.value;

                                    handleChange(
                                      index,
                                      "installmentAmount",
                                      val,
                                    );
                                  }}
                                  className="border rounded px-1 py-0.5 w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              ) : (
                                `$${Number(p.installmentAmount).toFixed(2)}`
                              )}
                            </td>
                            <td className="p-2">
                              {p.installmentPayments &&
                              p.installmentPayments.length > 0
                                ? (() => {
                                    const total = p.installmentPayments.reduce(
                                      (sum, ip) => sum + Number(ip.amount),
                                      0,
                                    );
                                    return `$${total.toFixed(2)}`;
                                  })()
                                : "—"}
                            </td>

                            <td className="p-2 hidden md:table-cell md:w-[15%]">
                              {p.installmentPayments &&
                              p.installmentPayments.length > 0
                                ? translatePaymentMethod(
                                    p.installmentPayments[0]?.payment?.type ??
                                      "",
                                  )
                                : ""}
                            </td>
                            <td className="p-2">
                              {p.paidAt
                                ? dayjs(p.paidAt.split("T")[0]).format(
                                    "DD-MM-YYYY",
                                  )
                                : "—"}
                            </td>
                            <td className="p-2">
                              <div className="flex items-center justify-between">
                                <span>{p.debt ? "$" + p.debt : ""}</span>

                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAskRemoveInstallment(p.id, index)
                                    }
                                    className="text-white bg-red-600 hover:bg-red-700 p-1 rounded-full cursor-pointer"
                                    title="Eliminar cuota"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
              </tbody>
            </table>
          </div>
          <ConfirmModal
            open={openDeleteModal}
            title="Eliminar cuota"
            message="¿Estás seguro de que deseas eliminar esta cuota?"
            onConfirm={handleRemoveInstallment}
            onCancel={() => {
              setOpenDeleteModal(false);
              setInstallmentToDelete(null);
            }}
          />

          <div className="flex flex-wrap justify-end items-center mt-6 gap-2">
            {!isRequest && !isEditing && (
              <div>
                {loading || payments.length === 0 ? (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Cargando cuotas...
                  </button>
                ) : (
                  <PDFDownloadLink
                    document={
                      <MyPdfDocument
                        contract={contract}
                        installments={payments}
                      />
                    }
                    fileName={`Contrato ${
                      contract.customerId.firstName.split(" ")[0] +
                      " " +
                      contract.customerId.lastName.split(" ")[0]
                    }.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
                        disabled={pdfLoading}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        {pdfLoading ? "Generando PDF..." : "Descargar PDF"}
                      </button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!isRequest && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all"
                >
                  Editar cuotas
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSave}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                  >
                    Guardar cambios
                  </button>
                </>
              )}
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
