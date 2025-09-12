import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { userApi, type User } from "../api/user";
import { ContractApi, type ResponseCountContract } from "../api/contract";
import { useCallback, useEffect, useState } from "react";
import {
  ContractPaymentApi,
  type VendorPaymentsTotals,
  type VendorsWithDebts,
} from "../api/contract-payment";
import { formatMoney } from "../utils/formatMoney";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ResponseCountContract | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [payments, setPayments] = useState<VendorPaymentsTotals | null>(null);
  const [customers, setCustomers] = useState<VendorsWithDebts | null>(null);

  const userId =
    id && (user?.role === "main" || user?.role === "admin") ? id : user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const profileData = await userApi.getProfile(userId);

      if (!profileData) {
        // Perfil no encontrado
        setProfile(null);
        return;
      }

      setProfile(profileData);

      // Solo si el perfil existe, obtenemos estadísticas y pagos
      const [statsData, paymentsData, customersData] = await Promise.all([
        ContractApi.countContractsByVendor(userId),
        ContractPaymentApi.getOneVendorPaymentsSummary(userId),
        ContractPaymentApi.getOverdueCustomersByOneVendor(userId),
      ]);

      setStats(statsData);
      setPayments(paymentsData);
      setCustomers(customersData);
    } catch (err) {
      console.error("Error loading profile", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p className="p-4">Cargando...</p>;

  if (!userId || profile === null)
    return <p className="p-4">Usuario no encontrado</p>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow-sm transition cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Regresar
      </button>

      {/* Perfil */}
      {profile && (
        <section className="bg-white rounded-2xl shadow p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </section>
      )}

      {/* Estadísticas de Contratos */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Contratos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Activos</p>
            <p className="text-lg font-bold text-green-700">
              {stats?.activeContracts}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Pend. Despacho</p>
            <p className="text-lg font-bold text-blue-700">
              {stats?.pendingToDispatch}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Cancelados</p>
            <p className="text-lg font-bold text-red-700">
              {stats?.canceledContracts}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Completados</p>
            <p className="text-lg font-bold text-gray-700">
              {stats?.completedContracts}
            </p>
          </div>
        </div>
      </section>

      {/* Resumen de Pagos */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Resumen de Pagos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Cobrado</p>
            <p className="text-lg font-bold text-green-700">
              ${formatMoney(payments?.totalAmountPaid || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Atrasado</p>
            <p className="text-lg font-bold text-red-700">
              ${formatMoney(payments?.totalOverdueDebt || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Pendiente</p>
            <p className="text-lg font-bold text-yellow-700">
              ${formatMoney(payments?.totalPendingBalance || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500">Deuda Total</p>
            <p className="text-lg font-bold text-gray-700">
              ${formatMoney(payments?.totalDebt || 0)}
            </p>
          </div>
        </div>
      </section>

      {/* Lista de Clientes con Deudas */}
      {customers && customers.customers.length > 0 ? (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Clientes con Contratos Atrasados
          </h3>
          <div className="space-y-4">
            {customers.customers.map((customer) => (
              <div
                key={customer.customerId}
                className="bg-white rounded-xl shadow p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {customer.customerName}
                </h4>
                <ul className="space-y-1">
                  {customer.contracts.map((c) => {
                    const cuotasDisplay =
                      c.overdueNumbers.length > 3
                        ? `#${c.overdueNumbers[0]} … #${
                            c.overdueNumbers[c.overdueNumbers.length - 1]
                          }`
                        : c.overdueNumbers.map((n) => `#${n}`).join(", ");

                    return (
                      <li
                        key={c.contractId}
                        className="grid grid-cols-[150px_auto_100px] items-center border-b last:border-0 py-1 text-sm"
                      >
                        {/* Columna 1 */}
                        <span className="text-gray-700">
                          Contrato: #{c.contractCode}
                        </span>

                        {/* Columna 2 */}
                        <span className="text-gray-600 justify-self-center text-center">
                          Cuotas: {c.overdueInstallments}{" "}
                          <span className="italic text-gray-500">
                            ({cuotasDisplay})
                          </span>
                        </span>

                        {/* Columna 3 */}
                        <span className="text-right font-bold text-red-600 justify-self-end">
                          ${formatMoney(c.overdueAmount)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          <span className="text-lg">✔</span>
          <span>Todos los clientes se encuentran al día</span>
        </div>
      )}
    </div>
  );
}
