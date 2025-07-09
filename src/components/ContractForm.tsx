import { useEffect, useState } from "react";
import type { Contract, CreateContract } from "../api/contract";
import type { User } from "../api/user";

interface Props {
  initialData?: Contract | null;
  onSubmit: (data: CreateContract) => void;
  vendors?: User[];
  customers?: User[];
}

export const ContractForm = ({
  initialData,
  onSubmit,
  vendors = [],
  customers = [],
}: Props) => {
  const [form, setForm] = useState<CreateContract>({
    vendorId: "",
    customerId: "",
    requestDate: new Date().toISOString().slice(0, 10),
    startDate: null,
    installmentAmount: 0,
    agreement: "weekly",
    totalPrice: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        vendorId: initialData.vendorId.id,
        customerId: initialData.customerId.id,
        requestDate: initialData.requestDate?.slice(0, 10) || "",
        startDate: initialData.startDate?.slice(0, 10) || null,
        endDate: initialData.endDate?.slice(0, 10) || "",
        installmentAmount: initialData.installmentAmount || 0,
        agreement: initialData.agreement || "weekly",
        totalPrice: initialData.totalPrice || 0,
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
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
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

      {/* Monto de cuota y total */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="endDate" className="block text-sm mb-1">
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
      </div>

      {/* Acuerdo */}
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

      {/* Botón */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar contrato
      </button>
    </form>
  );
};
