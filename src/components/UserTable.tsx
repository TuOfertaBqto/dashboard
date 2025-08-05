import type { User } from "../api/user";
import { useAuth } from "../auth/useAuth";
import { translateUserRole } from "../utils/translations";
import { DeleteButton, EditButton } from "./ActionButtons";

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
            {userRole !== "vendor" && <th className="p-3 w-[75px]">Codigo</th>}
            <th className="p-3">Nombre</th>
            <th className="p-3">Correo</th>
            {userRole !== "vendor" && <th className="p-3">Rol</th>}
            <th className="p-3">Acciones</th>
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
                {userRole !== "vendor" && (
                  <td className="p-3 w-[75px]">
                    {user.code ? `T${user.code}` : ""}
                  </td>
                )}
                <td className="p-3">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3">{user.email}</td>
                {userRole !== "vendor" && (
                  <td className="p-3">{translateUserRole(user.role)}</td>
                )}
                {(userRole === "main" ||
                  user.role === "vendor" ||
                  user.role === "customer") && (
                  <td className="p-3 space-x-2">
                    <EditButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user);
                      }}
                    />
                    {userRole !== "vendor" && (
                      <DeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(user.id);
                        }}
                      />
                    )}
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
