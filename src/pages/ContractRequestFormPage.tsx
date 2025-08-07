import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContractRequestFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerId: "",
    products: [],
    // ...otros campos necesarios
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí llamas a tu API
    console.log("Enviando solicitud:", form);
    navigate("/contracts/request"); // redirige después de guardar
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-xl rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Crear solicitud de contrato</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Cliente
          </label>
          <input
            type="text"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Otros campos aquí */}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-lg text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
