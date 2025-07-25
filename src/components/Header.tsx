import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../auth/useAuth";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export const Header = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-800">
        Panel Administrativo
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <div className="font-medium text-gray-800">{user.email}</div>
            <div className="text-sm text-gray-500 capitalize">
              {user.role.replace("_", " ")}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="p-2 rounded hover:bg-gray-100 transition"
          title="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
        </button>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </header>
  );
};
