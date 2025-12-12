import { useCallback, useEffect, useMemo, useState } from "react";
import { ContractApi, type ResponseCountContract } from "../api/contract";
import { userApi, type User, type VendorStats } from "../api/user";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { InstallmentApi, type GlobalPaymentsTotals } from "../api/installment";
import { DebtsReportPDF } from "../components/pdf/DebtsReportPDF";
import dayjs from "dayjs";
import { pdf } from "@react-pdf/renderer";
import { VendorsTotalsPDF } from "../components/pdf/VendorsTotalsPDF";
import { useNavigate } from "react-router-dom";
import { SummaryPayment } from "../components/dashboard/SummaryPayment";
import { PaymentApi, type PaymentSummary } from "../api/payment";
import { ContractCountCard } from "../components/dashboard/ContractCountCard";
import { Balance } from "../components/dashboard/Balance";
import {
  PaymentAccountApi,
  type TotalsByAccount,
} from "../api/payment-account";
import { useAuth } from "../auth/useAuth";
import {
  ContractProductApi,
  type ProductDispatchedTotals,
} from "../api/contract-product";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);
  const [stats, setStats] = useState<ResponseCountContract>();
  const [vendors, setVendors] = useState<VendorStats[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [products, setProducts] = useState<{
    data: ProductDispatchedTotals[];
    total: number;
  }>();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [paymentByAccount, setPaymentByAccount] = useState<TotalsByAccount[]>(
    []
  );
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloadingVendorTotals, setIsDownloadingVendorTotals] =
    useState<boolean>(false);
  const start = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const end = useMemo(() => new Date(), []);
  const [globalTotals, setGlobalTotals] = useState<GlobalPaymentsTotals>({
    totalAmountPaid: 0,
    totalOverdueDebt: 0,
    totalPendingBalance: 0,
    totalDebt: 0,
  });
  const [profile, setProfile] = useState<User>();
  const firstName = useMemo(
    () => profile?.firstName?.split(" ")[0] ?? "",
    [profile?.firstName]
  );

  const downloadPDF = async (blobPromise: Promise<Blob>, filename: string) => {
    const blob = await blobPromise;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const now = dayjs().format("YYYYMMDD");
      const vendors = await InstallmentApi.getOverdueCustomersByVendor();

      await downloadPDF(
        pdf(<DebtsReportPDF vendors={vendors} />).toBlob(),
        `Cuotas atrasadas ${now}.pdf`
      );
    } catch (error) {
      console.error("Error al generar el reporte:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadVendorsTotalsPDF = async () => {
    try {
      setIsDownloadingVendorTotals(true);
      const now = dayjs().format("YYYYMMDD");
      const vendors = await InstallmentApi.getVendorPaymentsSummary();

      await downloadPDF(
        pdf(
          <VendorsTotalsPDF totals={globalTotals} vendors={vendors} />
        ).toBlob(),
        `Relacion vencimiento vendedores ${now}.pdf`
      );
    } catch (error) {
      console.error(
        "Error al generar el reporte Relacion vencimiento vendedores:",
        error
      );
    } finally {
      setIsDownloadingVendorTotals(false);
    }
  };

  const onPageChange = async (page: number) => {
    if (page < 1) return;

    if (!products) return;

    const totalPages = Math.ceil(products.total / limit);
    if (page > totalPages) return;

    setCurrentPage(page);
    setLoadingProduct(true);
    const productData = await ContractProductApi.getDispatchedTotals(
      page,
      limit
    );
    setProducts(productData);
    setLoadingProduct(false);
  };

  const fetchSummary = useCallback(async (start: string, end: string) => {
    const [summary, totalsByAccount] = await Promise.all([
      PaymentApi.getSummaryByType(start, end),
      PaymentAccountApi.getTotalsByAccount(start, end),
    ]);

    setPaymentSummary(summary);
    setPaymentByAccount(totalsByAccount);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setLoadingProduct(true);

        const [contracts, vendorsStats, totals, profileResult, productData] =
          await Promise.all([
            ContractApi.getCount(),
            userApi.getVendorStats(),
            InstallmentApi.getGlobalPaymentsSummary(),
            userApi.getProfile(user.id),
            ContractProductApi.getDispatchedTotals(1, 10),
          ]);

        setStats(contracts);
        setVendors(vendorsStats);
        setGlobalTotals(totals);
        setProfile(profileResult);
        setProducts(productData);

        setLoadingProduct(false);

        await fetchSummary(start.toISOString(), end.toISOString());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [start, end, fetchSummary, user?.id]);

  return (
    <div className="md:p-6 space-y-6">
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Hola {firstName}</h1>

          {stats && <ContractCountCard stats={stats} />}

          <Balance totals={globalTotals} />

          <SummaryPayment
            payments={paymentSummary}
            paymentByAccount={paymentByAccount}
            initialStart={start.toISOString().split("T")[0]}
            initialEnd={end.toISOString().split("T")[0]}
            onFetch={fetchSummary}
          />

          <div className="bg-white shadow-md rounded-2xl p-4 space-y-4">
            <h2 className="text-xl font-semibold">Reportes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between border rounded-xl p-4 bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-700">
                    Deudas por vendedor
                  </p>
                  <p className="text-sm text-gray-500">
                    Reporte de las cuotas vencidas de clientes, agrupadas por
                    vendedor.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className={`mt-3 px-4 py-2 rounded-lg shadow transition flex items-center justify-center gap-2 font-medium w-full sm:w-auto
    ${
      isDownloading
        ? "bg-blue-600 text-white cursor-not-allowed opacity-70"
        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
    }`}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>{isDownloading ? "Descargando..." : "Descargar"}</span>
                </button>
              </div>

              <div className="flex flex-col justify-between border rounded-xl p-4 bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-700">
                    Pagos por vendedor
                  </p>
                  <p className="text-sm text-gray-500">
                    Resumen de los pagos, organizados por vendedor.
                  </p>
                </div>
                <button
                  onClick={downloadVendorsTotalsPDF}
                  disabled={isDownloadingVendorTotals}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium shadow transition w-full sm:w-auto
    ${
      isDownloadingVendorTotals
        ? "bg-blue-600 text-white cursor-not-allowed opacity-70"
        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
    }`}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>
                    {isDownloadingVendorTotals ? "Descargando..." : "Descargar"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Productos más despachados
            </h2>

            <div className="hidden md:block overflow-x-auto">
              {loadingProduct ? (
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-2 border-b">Producto</th>
                      <th className="px-4 py-2 border-b text-center">
                        Despachos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3 border-b">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </td>
                        <td className="px-4 py-3 border-b text-center">
                          <div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-2 border-b">Producto</th>
                      <th className="px-4 py-2 border-b text-center">
                        Despachos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.data.map((p) => (
                      <tr
                        key={p.productId}
                        className="hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition"
                      >
                        <td className="px-4 py-2 border-b whitespace-nowrap">
                          {p.productName}
                        </td>
                        <td className="px-4 py-2 border-b text-center font-semibold text-blue-700">
                          {p.totalDispatched}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="md:hidden space-y-3">
              {loadingProduct
                ? [...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 bg-gray-50 shadow-sm animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mt-2"></div>
                    </div>
                  ))
                : products?.data.map((p) => (
                    <div
                      key={p.productId}
                      className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                    >
                      <p className="font-semibold text-gray-800">
                        {p.productName}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium text-gray-600">
                          Despachos:
                        </span>{" "}
                        <span className="font-semibold text-blue-700">
                          {p.totalDispatched}
                        </span>
                      </p>
                    </div>
                  ))}
            </div>

            {products && (
              <div className="flex justify-center items-center gap-3 mt-5">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loadingProduct}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
          ${
            currentPage === 1 || loadingProduct
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        `}
                >
                  Anterior
                </button>

                <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl whitespace-nowrap min-w-fit flex-shrink-0">
                  Página {currentPage} de {Math.ceil(products.total / limit)}
                </span>

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={
                    currentPage >= Math.ceil(products.total / limit) ||
                    loadingProduct
                  }
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
          ${
            currentPage >= Math.ceil(products.total / limit) || loadingProduct
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        `}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow-md rounded-2xl p-4 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Vendedores</h2>
            <div className="hidden md:block">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2 border-b">Código</th>
                    <th className="px-4 py-2 border-b">Nombre</th>
                    <th className="px-4 py-2 border-b">Activos</th>
                    <th className="px-4 py-2 border-b">Pendientes</th>
                    <th className="px-4 py-2 border-b">Cancelados</th>
                    <th className="px-4 py-2 border-b">Finalizados</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => navigate(`/profile/${v.id}`)}
                      className="hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                    >
                      <td className="px-4 py-2 border-b">T{v.code}</td>
                      <td className="px-4 py-2 border-b">{v.vendorName}</td>
                      <td className="px-4 py-2 border-b">
                        {v.activeContracts}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {v.pendingContracts}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {v.cancelledContracts}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {v.finishedContracts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden border rounded-lg overflow-hidden shadow-sm">
              <div className="grid grid-cols-[40px_1fr_repeat(4,40px)] bg-gray-100 text-xs font-semibold text-gray-600">
                <div className="p-2">Cód</div>
                <div className="p-2">Vendedor</div>
                <div className="p-2 text-center">Act.</div>
                <div className="p-2 text-center">Pend.</div>
                <div className="p-2 text-center">Canc.</div>
                <div className="p-2 text-center">Fin.</div>
              </div>

              {vendors.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/profile/${v.id}`)}
                  className="grid grid-cols-[40px_1fr_repeat(4,40px)] border-t text-xs items-center hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                >
                  <div className="p-2 font-semibold text-gray-700">
                    T{v.code}
                  </div>
                  <div className="p-2 font-medium whitespace-nowrap overflow-hidden truncate">
                    {v.vendorName}
                  </div>
                  <div className="p-2 text-center">{v.activeContracts}</div>
                  <div className="p-2 text-center">{v.pendingContracts}</div>
                  <div className="p-2 text-center">{v.cancelledContracts}</div>
                  <div className="p-2 text-center">{v.finishedContracts}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
