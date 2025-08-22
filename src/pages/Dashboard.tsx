import { useEffect, useState } from "react";
import { ContractApi } from "../api/contract";
import { userApi, type VendorStats } from "../api/user";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type DashboardStats = {
  activeContracts: number;
  pendingToDispatch: number;
  canceledContracts: number;
  completedContracts: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vendors, setVendors] = useState<VendorStats[]>([]);

  useEffect(() => {
    ContractApi.getCount().then((res) => setStats(res));
    userApi.getVendorStats().then((res) => setVendors(res));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bienvenido al Dashboard</h1>

      {/* Cards con métricas */}
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

      {/* Tabla de vendedores */}
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
                <tr key={v.code} className="hover:bg-gray-50">
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

        {/* Vista móvil: tabla optimizada con nombre truncado si es muy largo */}
        <div className="md:hidden border rounded-lg overflow-hidden shadow-sm">
          {/* Encabezados */}
          <div className="grid grid-cols-[40px_1fr_repeat(4,40px)] bg-gray-100 text-xs font-semibold text-gray-600">
            <div className="p-2">Cód</div>
            <div className="p-2">Vendedor</div>
            <div className="p-2 text-center">Act.</div>
            <div className="p-2 text-center">Pend.</div>
            <div className="p-2 text-center">Canc.</div>
            <div className="p-2 text-center">Fin.</div>
          </div>

          {/* Filas */}
          {vendors.map((v) => (
            <div
              key={v.code}
              className="grid grid-cols-[40px_1fr_repeat(4,40px)] border-t text-xs items-center"
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
