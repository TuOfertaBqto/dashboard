import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../auth/useAuth";

export const Header = () => {
  const { user, logout } = useAuth();

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
          onClick={logout}
          className="p-2 rounded hover:bg-gray-100 transition"
          title="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
};
