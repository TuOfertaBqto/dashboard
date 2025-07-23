import type { User } from "../api/user";
import { useAuth } from "../auth/useAuth";

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable = ({ users, loading, onEdit, onDelete }: Props) => {
  const { user } = useAuth();
  const userRole = user?.role ?? "";
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700 text-left">
          <tr>
            <th className="p-3 w-[75px]">Codigo</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Rol</th>
            {userRole === "main" && <th className="p-3">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-400">
                {loading ? "Cargando..." : "No hay usuarios registrados."}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3 w-[75px]">
                  {user.code ? `C${user.code}` : ""}
                </td>
                <td className="p-3">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                {userRole === "main" && (
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
