import { useEffect, useState } from "react";
import type { Contract, CreateContract } from "../api/contract";
import type { User } from "../api/user";
import { useNavigate } from "react-router-dom";

interface Props {
  initialData?: Contract | null;
  onSubmit: (data: CreateContract) => void;
  vendors?: User[];
  customers?: User[];
  products?: { id: string; name: string }[];
}

export const ContractForm = ({
  initialData,
  //onSubmit,
  vendors = [],
  customers = [],
  products = [],
}: Props) => {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateContract>({
    vendorId: "",
    customerId: "",
    requestDate: new Date().toISOString().slice(0, 10),
    startDate: null,
    installmentAmount: 0,
    agreement: "weekly",
    totalPrice: 0,
    products: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        vendorId: initialData.vendorId.id,
        customerId: initialData.customerId.id,
        requestDate: initialData.requestDate?.slice(0, 10) || "",
        startDate: initialData.startDate?.slice(0, 10) || null,
        installmentAmount: initialData.installmentAmount || 0,
        agreement: initialData.agreement || "weekly",
        totalPrice: initialData.totalPrice || 0,
        products: initialData.products.map((p) => ({
          productId: p.product.id,
          quantity: 1, // Default quantity, TODO: fix as needed
        })),
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "installmentAmount" || name === "totalPrice"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //onSubmit(form);
    console.log("Submitting contract form with data:", form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded shadow p-6 space-y-6"
    >
      {/* Vendedor */}
      <div>
        <label htmlFor="vendorId" className="block text-sm mb-1">
          Vendedor
        </label>
        <select
          id="vendorId"
          name="vendorId"
          value={form.vendorId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Seleccione un vendedor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.firstName} {v.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Cliente */}
      <div>
        <label htmlFor="customerId" className="block text-sm mb-1">
          Cliente
        </label>
        <select
          id="customerId"
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Seleccione un cliente</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="requestDate" className="block text-sm mb-1">
            Fecha de solicitud
          </label>
          <input
            id="requestDate"
            type="date"
            name="requestDate"
            value={form.requestDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm mb-1">
            Fecha de inicio
          </label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm mb-1">
            Fecha de fin
          </label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            value={form.endDate || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-100"
            disabled
          />
        </div>
      </div>

      {/* Monto de cuota y Acuerdo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="installmentAmount" className="block text-sm mb-1">
            Monto por cuota ($)
          </label>
          <input
            id="installmentAmount"
            type="number"
            step="0.01"
            name="installmentAmount"
            value={form.installmentAmount}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="agreement" className="block text-sm mb-1">
            Frecuencia de pago
          </label>
          <select
            id="agreement"
            name="agreement"
            value={form.agreement ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="weekly">Semanal</option>
            <option value="fortnightly">Quincenal</option>
          </select>
        </div>
      </div>

      {/* Acuerdo */}
      <div>
        <label htmlFor="totalPrice" className="block text-sm mb-1">
          Precio total ($)
        </label>
        <input
          id="totalPrice"
          type="number"
          step="0.01"
          name="totalPrice"
          value={form.totalPrice}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Productos</h3>

        {form.products.map((p, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            <select
              value={p.productId}
              onChange={(e) => {
                const updated = [...form.products];
                updated[index].productId = e.target.value;
                setForm({ ...form, products: updated });
              }}
              className="border p-2 rounded"
              required
            >
              <option value="">Producto</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Cantidad"
              value={p.quantity}
              onChange={(e) => {
                const updated = [...form.products];
                updated[index].quantity = parseInt(e.target.value);
                setForm({ ...form, products: updated });
              }}
              className="border p-2 rounded"
              required
            />

            {/* Si tienes un campo de precio opcional, agrégalo aquí también */}

            <button
              type="button"
              onClick={() => {
                const updated = [...form.products];
                updated.splice(index, 1); // elimina el producto
                setForm({ ...form, products: updated });
              }}
              className="text-red-600 hover:underline text-sm"
            >
              Eliminar
            </button>
          </div>
        ))}

        <button
          type="button"
          className="text-blue-600 hover:underline text-sm"
          onClick={() =>
            setForm({
              ...form,
              products: [...form.products, { productId: "", quantity: 1 }],
            })
          }
        >
          + Agregar producto
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/contracts")}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};
