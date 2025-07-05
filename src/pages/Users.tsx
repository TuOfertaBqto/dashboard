import { useEffect, useState } from "react";
import { UserTable } from "../components/UserTable";
import { UserFormModal } from "../components/UserFormModal";
import { userApi, type User } from "../api/user";

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (id: string) => {
    // 🔁 Aquí conectas con tu API para eliminar
    console.log("Eliminar usuario con ID:", id);
  };

  const handleSaveUser = (data: Partial<User>) => {
    // 🔁 Aquí conectas con tu API para crear o actualizar
    console.log("Guardar usuario:", data);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userApi.getAll();
        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Crear usuario
        </button>
      </div>

      <UserTable
        users={users}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteUser}
      />

      <UserFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        initialData={selectedUser}
      />
    </div>
  );
}
