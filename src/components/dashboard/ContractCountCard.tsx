import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import type { ResponseCountContract } from "../../api/contract";

interface ContractCountCardProps {
  stats: ResponseCountContract;
}

export const ContractCountCard = ({ stats }: ContractCountCardProps) => {
  const {
    activeContracts,
    canceledContracts,
    completedContracts,
    pendingToDispatch,
  } = stats;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link
        to="/contracts/status/active"
        className="flex items-center bg-green-50 shadow-md rounded-2xl p-6 cursor-pointer hover:shadow-lg transition"
      >
        <CheckCircleIcon className="h-10 w-10 text-green-600 mr-4" />
        <div>
          <p className="text-gray-600">Contratos Activos</p>
          <p className="text-2xl font-bold">{activeContracts}</p>
        </div>
      </Link>

      <Link
        to="/contracts/status/to-dispatch"
        className="flex items-center bg-blue-50 shadow-md rounded-2xl p-6 cursor-pointer hover:shadow-lg transition"
      >
        <TruckIcon className="h-10 w-10 text-blue-600 mr-4" />
        <div>
          <p className="text-gray-600">Por despachar</p>
          <p className="text-2xl font-bold">{pendingToDispatch}</p>
        </div>
      </Link>

      <Link
        to="/contracts/status/canceled"
        className="flex items-center bg-red-50 shadow-md rounded-2xl p-6 cursor-pointer hover:shadow-lg transition"
      >
        <XCircleIcon className="h-10 w-10 text-red-600 mr-4" />
        <div>
          <p className="text-gray-600">Cancelados</p>
          <p className="text-2xl font-bold">{canceledContracts}</p>
        </div>
      </Link>

      <Link
        to="/contracts/status/completed"
        className="flex items-center bg-gray-50 shadow-md rounded-2xl p-6 cursor-pointer hover:shadow-lg transition"
      >
        <ClipboardDocumentCheckIcon className="h-10 w-10 text-gray-600 mr-4" />
        <div>
          <p className="text-gray-600">Finalizados</p>
          <p className="text-2xl font-bold">{completedContracts}</p>
        </div>
      </Link>
    </div>
  );
};
