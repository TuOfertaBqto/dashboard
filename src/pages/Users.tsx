import { useEffect, useState } from "react";
import { UserTable } from "../components/UserTable";
// import { UserFormModal } from "../components/UserFormModal";
import { userApi, type User } from "../api/user";
import { useNavigate } from "react-router-dom";

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const handleOpenCreate = () => {
  //   setSelectedUser(null);
  //   setIsModalOpen(true);
  // };

  // const handleOpenEdit = (user: User) => {
  //   setSelectedUser(user);
  //   setIsModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setSelectedUser(null);
  // };
  const fetchUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    // 🔁 Aquí conectas con tu API para eliminar
    console.log("Eliminar usuario con ID:", id);
    await userApi.remove(id);
  };

  // const handleSaveUser = async (data: Partial<User>) => {
  //   const {
  //     firstName,
  //     lastName,
  //     documentId,
  //     email,
  //     phoneNumber,
  //     adress,
  //     role,
  //   } = data;

  //   try {
  //     if (selectedUser) {
  //       await userApi.update(selectedUser.id, {
  //         firstName,
  //         lastName,
  //         documentId,
  //         email,
  //         phoneNumber,
  //         adress,
  //         role,
  //       });
  //     } else {
  //       await userApi.create(data);
  //     }

  //     await fetchUsers();
  //     setIsModalOpen(false);
  //     setSelectedUser(null);
  //   } catch (error) {
  //     console.error("Error al guardar usuario:", error);
  //   }
  // };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          onClick={() => navigate("/users/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Crear usuario
        </button>
      </div>

      <UserTable
        users={users}
        onEdit={(user) => navigate(`/users/${user.id}/edit`)}
        onDelete={handleDeleteUser}
      />

      {/* <UserFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        initialData={selectedUser}
      /> */}
    </div>
  );
}
