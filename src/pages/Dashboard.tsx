import { useEffect, useState } from "react";
import { ContractApi, type ResponseCountContract } from "../api/contract";
import { userApi, type VendorStats } from "../api/user";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ContractPaymentApi } from "../api/contract-payment";
import { DebtsReportPDF } from "../components/pdf/DebtsReportPDF";
import dayjs from "dayjs";
import { pdf } from "@react-pdf/renderer";
import { VendorsTotalsPDF } from "../components/pdf/VendorsTotalsPDF";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ResponseCountContract | null>(null);
  const [vendors, setVendors] = useState<VendorStats[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloadingVendorTotals, setIsDownloadingVendorTotals] =
    useState<boolean>(false);

  useEffect(() => {
    ContractApi.getCount().then((res) => setStats(res));
    userApi.getVendorStats().then((res) => setVendors(res));
  }, []);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const vendors = await ContractPaymentApi.getOverdueCustomersByVendor();

      const blob = await pdf(<DebtsReportPDF vendors={vendors} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const now = dayjs().format("YYYYMMDD");
      link.download = `Cuotas atrasadas ${now}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el reporte:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadVendorsTotalsPDF = async () => {
    try {
      setIsDownloadingVendorTotals(true);

      const vendors = await ContractPaymentApi.getVendorPaymentsSummary();
      const globalTotals = await ContractPaymentApi.getGlobalPaymentsSummary();

      const blob = await pdf(
        <VendorsTotalsPDF totals={globalTotals} vendors={vendors} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const now = dayjs().format("YYYYMMDD");
      link.download = `Relacion vencimiento vendedores ${now}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Error al generar el reporte Relacion vencimiento vendedores:",
        error
      );
    } finally {
      setIsDownloadingVendorTotals(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bienvenido al Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center bg-green-50 shadow-md rounded-2xl p-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600 mr-4" />
          <div>
            <p className="text-gray-600">Contratos Activos</p>
            <p className="text-2xl font-bold">{stats?.activeContracts ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center bg-blue-50 shadow-md rounded-2xl p-6">
          <TruckIcon className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <p className="text-gray-600">Por despachar</p>
            <p className="text-2xl font-bold">
              {stats?.pendingToDispatch ?? 0}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-red-50 shadow-md rounded-2xl p-6">
          <XCircleIcon className="h-10 w-10 text-red-600 mr-4" />
          <div>
            <p className="text-gray-600">Cancelados</p>
            <p className="text-2xl font-bold">
              {stats?.canceledContracts ?? 0}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 shadow-md rounded-2xl p-6">
          <ClipboardDocumentCheckIcon className="h-10 w-10 text-gray-600 mr-4" />
          <div>
            <p className="text-gray-600">Finalizados</p>
            <p className="text-2xl font-bold">
              {stats?.completedContracts ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-2xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">Reportes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between border rounded-xl p-4 bg-gray-50">
            <div>
              <p className="font-semibold text-gray-700">Deudas por vendedor</p>
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
              <p className="font-semibold text-gray-700">Pagos por vendedor</p>
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
                  <td className="px-4 py-2 border-b">{v.activeContracts}</td>
                  <td className="px-4 py-2 border-b">{v.pendingContracts}</td>
                  <td className="px-4 py-2 border-b">{v.cancelledContracts}</td>
                  <td className="px-4 py-2 border-b">{v.finishedContracts}</td>
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
              <div className="p-2 font-semibold text-gray-700">T{v.code}</div>
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
    </div>
  );
}
