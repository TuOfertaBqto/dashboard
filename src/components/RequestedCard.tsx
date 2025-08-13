import { type Contract } from "../api/contract";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { UserRole } from "../api/user";
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  role: UserRole;
  contract: Contract;
  onApprove: (id: string) => Promise<Contract>;
  onCancel: (id: string) => Promise<Contract>;
  onDelete: (id: string) => Promise<void>;
}

export function RequestedCard({
  role,
  contract,
  onApprove,
  onCancel,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletionId, setDeletionId] = useState<string | null>(null);

  const amount = contract.products.reduce((sum, cp) => {
    return sum + cp.product.installmentAmount * cp.quantity;
  }, 0);

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 transition hover:shadow-lg space-y-4 h-full flex flex-col">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Contrato #{contract.code}
          </h2>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              contract.status === "approved"
                ? "bg-green-100 text-green-700"
                : contract.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : contract.status === "canceled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {contract.status === "approved"
              ? "Aprobado"
              : contract.status === "pending"
              ? "Pendiente"
              : contract.status === "canceled"
              ? "Cancelado"
              : contract.status}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          {dayjs(contract.createdAt).utc().local().fromNow()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400 font-medium">Vendedor</p>
          <p className="text-gray-700 font-semibold">
            {contract.vendorId.firstName} {contract.vendorId.lastName}
          </p>
          <p className="text-gray-500">T{contract.vendorId.code}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400 font-medium">Cliente</p>
          <p className="text-gray-700 font-semibold">
            {contract.customerId.firstName} {contract.customerId.lastName}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-400 font-medium mb-1">Productos</p>
        <ul className="space-y-1">
          {contract.products.map((cp) => (
            <li key={cp.id} className="flex justify-between text-sm">
              <span>{cp.product.name}</span>
              <span className="text-gray-600">x{cp.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400 font-medium">Acuerdo</p>
          <p className="text-gray-700 font-semibold">
            {contract.agreement === "weekly" ? "Semanal" : "Quincenal"} - $
            {amount * (contract.agreement === "weekly" ? 1 : 2)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400 font-medium">Total</p>
          <p className="font-bold text-green-600">${contract.totalPrice}</p>
        </div>
      </div>

      {contract.status === "pending" && (
        <div className="pt-2 border-t flex justify-end items-center mt-auto">
          <div className="flex gap-2">
            {(role === "main" || role === "vendor") &&
              contract.status === "pending" && (
                <button
                  className="px-3 py-1 rounded-md text-white text-sm bg-blue-500 cursor-pointer hover:bg-blue-600 transition"
                  onClick={() => navigate(`/requests/${contract.id}/edit`)}
                >
                  Editar
                </button>
              )}
            {role == "main" && (
              <>
                <button
                  className={`px-3 py-1 rounded-md text-white text-sm transition ${
                    approvingId === contract.id
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 cursor-pointer"
                  }`}
                  disabled={approvingId === contract.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setApprovingId(contract.id);
                    onApprove(contract.id).finally(() => {
                      setApprovingId(null);
                    });
                  }}
                >
                  {approvingId === contract.id ? "Aprobando..." : "Aprobar"}
                </button>

                <button
                  className={`px-3 py-1 rounded-md text-white text-sm transition 
              ${
                cancellingId === contract.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 cursor-pointer"
              }`}
                  disabled={cancellingId === contract.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCancellingId(contract.id);
                    onCancel(contract.id).finally(() => {
                      setCancellingId(null);
                    });
                  }}
                >
                  {cancellingId === contract.id ? "Cancelando..." : "Cancelar"}
                </button>
              </>
            )}

            {role == "vendor" && contract.status === "pending" && (
              <button
                className={`px-3 py-1 rounded-md text-white text-sm transition 
            ${
              deletionId === contract.id
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 cursor-pointer"
            }`}
                disabled={deletionId === contract.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletionId(contract.id);
                  onDelete(contract.id).finally(() => {
                    setDeletionId(null);
                  });
                }}
              >
                {deletionId === contract.id ? "Eliminando..." : "Eliminar"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
