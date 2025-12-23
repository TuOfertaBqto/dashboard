import {
  ArrowRightEndOnRectangleIcon,
  Bars3Icon,
  CubeIcon,
  DocumentArrowUpIcon,
  SquaresPlusIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../auth/useAuth";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { useLocation, useNavigate } from "react-router-dom";
import { useRequests } from "../contexts/requests/useRequests";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { requestsCount } = useRequests();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center relative z-50">
        <div className="hidden md:flex text-xl font-semibold text-gray-800">
          Panel Administrativo
        </div>

        <div className="md:hidden relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}

            {requestsCount > 0 &&
              !isMenuOpen &&
              location.pathname !== "/requests" && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600 border-2 border-white"></span>
                </span>
              )}
          </button>
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
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden focus:outline-none cursor-pointer"
          >
            <img
              src={
                "https://res.cloudinary.com/ddy2z86ai/image/upload/v1756922816/withoutPhoto_jv8xlt.png"
              }
              alt="Perfil"
              className="w-full h-full object-cover"
            />
          </button>

          {open && user && (
            <div className="absolute right-4 top-14 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate(`/profile/${user.id}`);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 cursor-pointer"
              >
                <UserIcon className="w-5 h-5 text-gray-500" />
                Ir al perfil
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-red-600 cursor-pointer"
              >
                <ArrowRightEndOnRectangleIcon className="w-5 h-5 text-red-500" />
                Cerrar sesión
              </button>
            </div>
          )}
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
              {["main", "admin", "vendor"].includes(user?.role ?? "") && (
                <li
                  className="p-4 flex items-center gap-2 active:bg-[#111827]"
                  onClick={() => {
                    setIsMenuOpen(false);
                    const path =
                      user?.role === "vendor"
                        ? `/profile/${user.id}`
                        : "/dashboard";
                    navigate(path);
                  }}
                >
                  <SquaresPlusIcon className="w-5 h-5" />
                  Reportes
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
                  {user?.role == "main" && requestsCount > 0
                    ? `Solicitudes (${requestsCount})`
                    : "Solicitudes"}
                </li>
              )}
              {user?.role !== "vendor" && (
                <>
                  <li
                    className="p-4 flex items-center gap-2 active:bg-[#111827]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/vendors");
                    }}
                  >
                    <UsersIcon className="h-5 w-5" />
                    Vendedores
                  </li>
                </>
              )}
              <li
                className="p-4 flex items-center gap-2 active:bg-[#111827]"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/users");
                }}
              >
                <UserGroupIcon className="h-5 w-5" />
                Usuarios
              </li>
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
