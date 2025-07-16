import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userApi, type User } from "../api/user";

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    role: "customer",
    phoneNumber: "",
    documentId: "",
    adress: "",
    code: null,
  });

  useEffect(() => {
    if (isEdit) {
      userApi
        .getById(id!)
        .then(setForm)
        .catch((err) => console.error("Error al cargar usuario:", err));
    }
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const {
          firstName,
          lastName,
          documentId,
          email,
          phoneNumber,
          adress,
          role,
        } = form;
        await userApi.update(id!, {
          firstName,
          lastName,
          documentId,
          email,
          phoneNumber,
          adress,
          role,
        });
      } else {
        await userApi.create(form);
      }

      navigate("/users");
    } catch (err) {
      console.error("Error al guardar usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Editar usuario" : "Crear nuevo usuario"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Apellido</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Correo</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
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
              <option value="main">Main</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="vendor">Vendedor</option>
              <option value="customer">Cliente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Teléfono</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Cédula</label>
            <input
              name="documentId"
              value={form.documentId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Dirección</label>
            <input
              name="adress"
              value={form.adress}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
