import { useState, useEffect } from "react";
import type { User } from "../api/user";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  initialData?: User | null;
}

export const UserFormModal = ({
  open,
  onClose,
  onSave,
  initialData,
}: Props) => {
  const [form, setForm] = useState<Partial<User>>({
    firstName: "",
    email: "",
    role: "admin",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ firstName: "", email: "", role: "admin" });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg"
      >
        <h2 className="text-xl font-semibold">
          {initialData ? "Editar usuario" : "Crear usuario"}
        </h2>

        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            name="name"
            value={form.firstName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Correo</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="admin">Admin</option>
            <option value="main">Main</option>
            <option value="branch_admin">Branch Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};
