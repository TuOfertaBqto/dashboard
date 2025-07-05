import { NavLink } from "react-router-dom";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>
      <nav className="flex flex-col gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "font-bold text-blue-500" : ""
          }
        >
          <div className="flex items-center gap-2">Dashboard</div>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? "font-bold text-blue-500" : ""
          }
        >
          <div className="flex items-center gap-2">Usuarios</div>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "font-bold text-blue-500" : ""
          }
        >
          <div className="flex items-center gap-2">Configuración</div>
        </NavLink>
      </nav>
    </aside>
  );
};
