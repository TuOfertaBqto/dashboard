import {
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  SquaresPlusIcon,
  Square3Stack3DIcon,
  ChevronDownIcon,
  UsersIcon,
  ArrowRightEndOnRectangleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ConfirmModal } from "./ConfirmModal";

interface SubMenuItem {
  name: string;
  route: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  route: string;
  subItems?: SubMenuItem[];
  color?: string;
}

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role ?? "";

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNavigation = (route: string) => navigate(route);

  const generalMenuItems: MenuItem[] = [
    {
      name: "Usuarios",
      icon: <UsersIcon className="h-5 w-5" />,
      route: "/users",
    },
    {
      name: "Inventario",
      icon: <Square3Stack3DIcon className="h-5 w-5" />,
      route: "/inventory",
      subItems: [
        { name: "Productos", route: "/products" },
        //{ name: "Presentaciones", route: "/presentations" },
        { name: "Categorías", route: "/categories" },
      ],
    },
  ];

  if (
    userRole === "main" ||
    userRole === "super_admin" ||
    userRole === "admin"
  ) {
    generalMenuItems.unshift(
      {
        name: "Pagos",
        icon: <CurrencyDollarIcon className="h-5 w-5" />,
        route: "/installments",
      },
      {
        name: "Contratos",
        icon: <DocumentTextIcon className="h-5 w-5" />,
        route: "/contracts",
      }
    );
  }

  if (userRole === "main" || userRole === "vendor") {
    generalMenuItems.unshift({
      name: "Solicitudes",
      icon: <DocumentArrowUpIcon className="h-5 w-5" />,
      route: "/requests",
    });
  }

  if (userRole === "main") {
    generalMenuItems.unshift({
      name: "Dashboard",
      icon: <SquaresPlusIcon className="h-5 w-5" />,
      route: "/dashboard",
    });
  }

  const otherMenuItems: MenuItem[] = [
    {
      name: "Cerrar sesión",
      icon: <ArrowRightEndOnRectangleIcon className="h-5 w-5" />,
      route: "/login",
      color: "text-red-500",
    },
  ];

  const isRouteActive = (route: string) => location.pathname === route;

  return (
    <aside
      className={`h-screen hidden md:flex flex-col transition-all duration-300 ease-out bg-[#1f2937] text-white  ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {isOpen && <h1 className="text-xl font-bold">Admin</h1>}
        <button onClick={toggleSidebar}>
          {isOpen ? (
            <Bars3BottomLeftIcon className="h-5 w-5 cursor-pointer" />
          ) : (
            <Bars3BottomRightIcon className="h-5 w-5 cursor-pointer" />
          )}
        </button>
      </div>

      {/* Menu principal */}
      <nav className="px-2">
        {generalMenuItems.map((item) => {
          const active =
            item.route === location.pathname ||
            item.subItems?.some((s) => s.route === location.pathname);

          return (
            <div key={item.name}>
              <div
                onClick={() =>
                  item.subItems
                    ? setOpenSubmenu(
                        openSubmenu === item.name ? null : item.name
                      )
                    : handleNavigation(item.route)
                }
                className={`flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-gray-700 ${
                  active ? "bg-gray-700" : ""
                }`}
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
                {item.subItems && isOpen && (
                  <ChevronDownIcon className="h-4 w-4 ml-auto" />
                )}
              </div>

              {/* SubItems */}
              {item.subItems && isOpen && openSubmenu === item.name && (
                <div className="ml-6 mt-2 flex flex-col gap-1">
                  {item.subItems.map((sub) => (
                    <div
                      key={sub.route}
                      className={`cursor-pointer text-sm rounded-md px-2 py-1 hover:bg-gray-600 ${
                        isRouteActive(sub.route) ? "bg-gray-600" : ""
                      }`}
                      onClick={() => handleNavigation(sub.route)}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Otros */}
      <nav className="px-2 mt-auto mb-4">
        {otherMenuItems.map((item) => (
          <div
            key={item.name}
            className={`flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-gray-700 ${item.color}`}
            onClick={() => setShowLogoutModal(true)}
          >
            {item.icon}
            {isOpen && <span>{item.name}</span>}
          </div>
        ))}
        <ConfirmModal
          open={showLogoutModal}
          title="Cerrar sesión"
          message="¿Estás seguro de que deseas cerrar sesión?"
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={async () => {
            logout();
            navigate("/login");
          }}
        />
      </nav>
    </aside>
  );
};
