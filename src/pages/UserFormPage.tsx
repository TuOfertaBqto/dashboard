import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userApi, type User } from "../api/user";
import { useAuth } from "../auth/useAuth";
import { TrashIcon } from "@heroicons/react/24/outline";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function UserFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState<boolean>(false);
  const [localImage, setLocalImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    role: "customer",
    phoneNumber: "",
    documentId: "",
    adress: "",
    code: null,
    documentIdPhoto: "",
  });

  useEffect(() => {
    if (isEdit) {
      userApi
        .getById(id!)
        .then(setForm)
        .catch((err) => console.error("Error al cargar usuario:", err));
    }
  }, [id, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setLocalImage(file);
      setForm({ ...form, documentIdPhoto: URL.createObjectURL(file) });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemoveImage = () => {
    setLocalImage(null);
    setForm({ ...form, documentIdPhoto: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    if (!res.ok) {
      throw new Error("Error subiendo la imagen a Cloudinary");
    }

    const json = await res.json();
    return json.secure_url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.documentIdPhoto && !localImage && form.role === "customer") {
      alert("Debes seleccionar una imagen.");
      return;
    }

    setLoading(true);

    try {
      let documentIdPhoto = form.documentIdPhoto || "";

      // Si hay imagen local nueva, subir a Cloudinary primero
      if (localImage) {
        documentIdPhoto = await uploadImageToCloudinary(localImage);
      }

      const payload = {
        ...form,
        documentIdPhoto,
      };

      if (isEdit) {
        const {
          firstName,
          lastName,
          documentId,
          email,
          phoneNumber,
          adress,
          role,
          documentIdPhoto,
        } = payload;
        await userApi.update(id!, {
          firstName,
          lastName,
          documentId,
          email,
          phoneNumber,
          adress,
          role,
          documentIdPhoto,
        });
      } else {
        await userApi.create(payload);
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
              {user?.role === "main" && (
                <>
                  <option value="main">Main</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                </>
              )}
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
              required
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

          {form.role === "customer" && (
            <div>
              <label className="block text-sm mb-1">Foto de la cédula</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-2 rounded cursor-pointer"
              />
              {form.documentIdPhoto && (
                <div
                  className="relative inline-block mt-2 rounded overflow-hidden cursor-pointer transition duration-300 ease-in-out brightness-100 hover:brightness-75"
                  title="Haz click para eliminar la imagen"
                  onClick={handleRemoveImage}
                >
                  <img
                    src={form.documentIdPhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="w-full h-full absolute inset-0 m-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <TrashIcon className="absolute inset-0 m-auto w-8 h-8 text-white " />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 cursor-pointer"
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
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
