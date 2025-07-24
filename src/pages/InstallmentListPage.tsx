import classNames from "classnames";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  ContractPaymentApi,
  type ContractPayment,
} from "../api/contract-payment";
import { useNavigate } from "react-router-dom";

export const InstallmentListPage = () => {
  const [installments, setInstallments] = useState<ContractPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await ContractPaymentApi.getAll();
        setInstallments(res);
        const installments = res;

        const groupedByContract = installments.reduce<
          Record<string, ContractPayment[]>
        >((acc, installment) => {
          const contractId = installment.contract.id;
          if (!acc[contractId]) acc[contractId] = [];
          acc[contractId].push(installment);
          return acc;
        }, {});

        const allowedIds = new Set<string>();
        Object.values(groupedByContract).forEach((group) => {
          const unpaid = group.filter((i) => !i.paidAt);
          if (unpaid.length === 0) return;

          const oldest = unpaid.reduce((a, b) =>
            dayjs(a.dueDate).isBefore(dayjs(b.dueDate)) ? a : b
          );

          allowedIds.add(oldest.id);
        });

        setEnabledIds(allowedIds);
      } catch (err) {
        console.log("Error loading installments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDueDateColor = (dueDate: string) => {
    const today = dayjs().startOf("day");
    const due = dayjs(dueDate).startOf("day");

    if (due.isBefore(today)) return "bg-red-100 text-red-700";
    if (due.isSame(today)) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Cuotas por cobrar</h1>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Contrato</th>
              <th className="p-3 text-left">Monto ($)</th>
              <th className="p-3 text-left">Fecha de vencimiento</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  {loading ? "Cargando..." : "No hay cuotas pendientes."}
                </td>
              </tr>
            ) : (
              installments.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="p-3">#{i.contract.code}</td>
                  <td className="p-3">
                    $
                    {Math.min(
                      i.contract.installmentAmount,
                      parseFloat(
                        i.debt?.toString() ??
                          i.contract.installmentAmount.toString()
                      )
                    )}
                  </td>
                  <td className="p-3">{i.dueDate.split("T")[0]}</td>
                  <td className="p-3">
                    <span
                      className={classNames(
                        "text-sm px-2 py-1 rounded font-medium",
                        getDueDateColor(i.dueDate.split("T")[0])
                      )}
                    >
                      {dayjs(i.dueDate.split("T")[0]).isBefore(dayjs(), "day")
                        ? "Vencida"
                        : dayjs(i.dueDate.split("T")[0]).isSame(dayjs(), "day")
                        ? "Vence hoy"
                        : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <button
                      disabled={!enabledIds.has(i.id)}
                      onClick={() => navigate(`/installments/${i.id}/pay`)}
                      className={classNames(
                        "px-3 py-1 rounded text-sm",
                        enabledIds.has(i.id)
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      Registrar pago
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
