import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi, type User } from "../api/user";
import { UserTable } from "../components/UserTable";
import { ConfirmModal } from "../components/ConfirmModal";

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteRequest = (user: User) => {
    setUserToDelete(user);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userApi.remove(userToDelete.id);

      fetchUsers();
    } catch (err) {
      console.error("Error eliminando usuario", err);
    } finally {
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          onClick={() => navigate("/users/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          + Crear usuario
        </button>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onEdit={(user) => navigate(`/users/${user.id}/edit`)}
        onDelete={(id) => {
          const user = users.find((u) => u.id === id);
          if (user) handleDeleteRequest(user);
        }}
      />

      <ConfirmModal
        open={!!userToDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.firstName} ${userToDelete?.lastName}?`}
        onCancel={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
