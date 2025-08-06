import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  SquaresPlusIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../auth/useAuth";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center relative z-50">
        <div className="hidden md:flex text-xl font-semibold text-gray-800">
          Panel Administrativo
        </div>

        <div className="md:hidden">
          {isMenuOpen ? (
            <button
              onClick={() => setIsMenuOpen(false)}
              className="h-6 w-6 text-gray-70"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMenuOpen(true);
              }}
            >
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            </button>
          )}
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
            className="p-2 rounded  transition"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden">
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          <div className="absolute top-18 left-0 w-full bg-[#1f2937] text-white shadow-md z-50 animate-slide-down md:hidden">
            <ul className="flex flex-col divide-y divide-gray-200">
              {user?.role == "main" && (
                <li
                  className="p-4 flex items-center gap-2 active:bg-[#111827]"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  <SquaresPlusIcon className="w-5 h-5" />
                  Dashboard
                </li>
              )}
              {(user?.role == "main" || user?.role == "vendor") && (
                <li
                  className="p-4 flex items-center gap-2 active:bg-[#111827]"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/requests");
                  }}
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Solicitudes
                </li>
              )}
              {user?.role !== "vendor" && (
                <>
                  <li
                    className="p-4 flex items-center gap-2 active:bg-[#111827]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/installments");
                    }}
                  >
                    <CurrencyDollarIcon className="h-5 w-5" />
                    Pagos
                  </li>
                  <li
                    className="p-4 flex items-center gap-2 active:bg-[#111827]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/contracts");
                    }}
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    Contratos
                  </li>
                </>
              )}
              <li
                className="p-4 flex items-center gap-2 active:bg-[#111827]"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/products");
                }}
              >
                <CubeIcon className="w-5 h-5" />
                Productos
              </li>
              <li
                className="p-4 flex items-center gap-2 active:bg-[#111827]"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/users");
                }}
              >
                <UsersIcon className="h-5 w-5" />
                Usuarios
              </li>
              <li
                className="p-4 text-red-600 flex items-center gap-2 active:bg-[#111827]"
                onClick={() => {
                  setShowLogoutModal(true);
                }}
              >
                <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
                Cerrar sesión
              </li>
            </ul>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showLogoutModal}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </>
  );
};
