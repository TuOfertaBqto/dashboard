import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { userApi, type User } from "../api/user";
import {
  ContractApi,
  type Contract,
  type ResponseCountContract,
} from "../api/contract";
import { useCallback, useEffect, useState } from "react";
import {
  InstallmentApi,
  type VendorPaymentsTotals,
  type VendorsWithDebts,
} from "../api/installment";
import { formatMoney } from "../utils/formatMoney";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { InstallmentModal } from "../components/InstallmentModal";
import { ContractProductApi } from "../api/contract-product";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ResponseCountContract | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [payments, setPayments] = useState<VendorPaymentsTotals | null>(null);
  const [customers, setCustomers] = useState<VendorsWithDebts | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  const userId =
    id && (user?.role === "main" || user?.role === "admin") ? id : user?.id;

  const handleOpenInstallments = async (contractId: string) => {
    try {
      const contract = await ContractApi.getById(contractId);
      setSelectedContract(contract);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching contract", error);
    }
  };

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
      const [statsData, paymentsData, customersData, balanceData] =
        await Promise.all([
          ContractApi.countContractsByVendor(userId),
          InstallmentApi.getOneVendorPaymentsSummary(userId),
          InstallmentApi.getOverdueCustomersByOneVendor(userId),
          ContractProductApi.getVendorEarnings(userId),
        ]);

      setStats(statsData);
      setPayments(paymentsData);
      setCustomers(customersData);
      setBalance(balanceData.total);
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
      {["main", "admin"].includes(user?.role ?? "") && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow-sm transition cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Regresar
        </button>
      )}

      {/* Perfil */}
      {profile && (
        <section className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-800 leading-tight">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
          </div>

          {profile.role !== "main" && (
            <>
              <div className="w-full h-px bg-gray-200 md:hidden" />
              <div className="flex flex-col text-left md:text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Ganancias
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  $
                  {balance.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </>
          )}
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
                        onClick={() => handleOpenInstallments(c.contractId)}
                        className="grid grid-cols-[150px_auto_100px] items-center border rounded-lg hover:shadow-md cursor-pointer transition-all duration-200 hover:bg-gray-50 py-2 px-3 text-sm"
                      >
                        {/* Columna 1 */}
                        <span className="text-gray-800 font-medium">
                          Contrato:{" "}
                          <span className="text-blue-600 font-semibold">
                            #{c.contractCode}
                          </span>
                        </span>

                        {/* Columna 2 */}
                        <span className="text-gray-600 justify-self-center text-center">
                          Cuotas:{" "}
                          <span className="font-medium text-gray-800">
                            {c.overdueInstallments}
                          </span>{" "}
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
      <InstallmentModal
        open={isModalOpen}
        isRequest
        onClose={() => setIsModalOpen(false)}
        contract={selectedContract}
      />
    </div>
  );
}
