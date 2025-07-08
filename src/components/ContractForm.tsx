import { useEffect, useState } from "react";
import type { Contract } from "../api/contract";

interface Props {
  initialData?: Contract | null;
  onSubmit: (data: Partial<Contract>) => void;
}

export const ContractForm = ({ initialData, onSubmit }: Props) => {
  const [form, setForm] = useState<Partial<Contract>>({
    vendor_id: "",
    customer_id: "",
    request_date: "",
    start_date: "",
    end_date: "",
    installment_amount: 0,
    agreement: "weekly",
    total_price: 0,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded shadow p-6 space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">Vendedor</label>
        <input
          name="vendor_id"
          value={form.vendor_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Cliente</label>
        <input
          name="customer_id"
          value={form.customer_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Fecha Solicitud</label>
          <input
            type="date"
            name="request_date"
            value={form.request_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* <div>
          <label className="block text-sm mb-1">Fecha fin</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div> */}
      </div>

      <div>
        <label className="block text-sm mb-1">Acuerdo</label>
        <select
          name="agreement"
          value={form.agreement}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="active">Semanal</option>
          <option value="fortnightly">Quincenal</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar
      </button>
    </form>
  );
};
