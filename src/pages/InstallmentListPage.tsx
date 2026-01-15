import dayjs from "dayjs";
import classNames from "classnames";
import { userApi } from "../api/user";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { InstallmentApi, type Installment } from "../api/installment";

export const InstallmentListPage = () => {
  const { id } = useParams();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageTitle, setPageTitle] = useState<string>("Cuotas por cobrar");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const userData = await userApi.getById(id);
        if (!userData.id) {
          setPageTitle("Vendedor no encontrado");
          setInstallments([]);
          return;
        }
        setPageTitle(
          `Cuotas por cobrar de T${userData.code} ${userData.firstName} ${userData.lastName}`
        );
        const res = await InstallmentApi.getAllByVendor(id);
        setInstallments(res);
      } catch (err) {
        console.log("Error loading installments", err);
        setPageTitle("Error al cargar cuotas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getDueDateColor = (dueDate: string) => {
    const today = dayjs().startOf("day");
    const due = dayjs(dueDate).startOf("day");

    if (due.isBefore(today)) return "bg-red-100 text-red-700";
    if (due.isSame(today)) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      {!loading ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow-sm transition cursor-pointer"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Contrato</th>
                  <th className="p-3 text-left">Cliente</th>
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
                        {i.contract.customerId.firstName}{" "}
                        {i.contract.customerId.lastName}
                      </td>
                      <td className="p-3">
                        $
                        {(
                          i.installmentAmount -
                          (i.installmentPayments?.reduce(
                            (total, ip) => total + Number(ip.amount),
                            0
                          ) || 0)
                        ).toFixed(2)}
                      </td>

                      <td className="p-3">
                        {dayjs(i.dueDate.split("T")[0]).format("DD-MM-YYYY")}
                      </td>
                      <td className="p-3">
                        <span
                          className={classNames(
                            "text-sm px-2 py-1 rounded font-medium",
                            getDueDateColor(i.dueDate.split("T")[0])
                          )}
                        >
                          {dayjs(i.dueDate.split("T")[0]).isBefore(
                            dayjs(),
                            "day"
                          )
                            ? "Vencida"
                            : dayjs(i.dueDate.split("T")[0]).isSame(
                                dayjs(),
                                "day"
                              )
                            ? "Vence hoy"
                            : "Pendiente"}
                        </span>
                      </td>
                      <td>
                        <button
                          disabled={!i.debt}
                          onClick={() => navigate(`/installments/${i.id}/pay`)}
                          className={classNames(
                            "px-3 py-1 rounded text-sm",
                            i.debt
                              ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
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
        </>
      ) : (
        <p className="py-6 text-gray-400">Cargando...</p>
      )}
    </div>
  );
};
