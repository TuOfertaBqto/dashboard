import { useEffect, useState } from "react";
import type { CreateProduct, Product } from "../api/product";

interface Props {
  initialData?: Product;
  onSubmit: (data: CreateProduct) => void;
}

export const ProductForm = ({ initialData, onSubmit }: Props) => {
  const [form, setForm] = useState<CreateProduct>({
    name: "",
    description: null,
    price: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description || null,
        price: initialData.price,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow space-y-4"
    >
      <div>
        <label className="block mb-1 text-sm">Nombre del producto</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Descripción</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Precio</label>
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
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
