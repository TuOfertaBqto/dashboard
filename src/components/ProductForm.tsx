import { useEffect, useState } from "react";
import type { CreateProduct, Product } from "../api/product";
import type { Category } from "../api/category";

interface Props {
  initialData?: Product;
  onSubmit: (data: CreateProduct) => Promise<void>;
  categories: Category[];
}

export const ProductForm = ({ initialData, onSubmit, categories }: Props) => {
  const [form, setForm] = useState<CreateProduct>({
    name: "",
    description: null,
    price: 0,
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description || null,
        price: initialData.price,
        categoryId: initialData.categoryId.id,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Descripción</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm mb-1">
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={loading}
        >
          <option value="">Seleccione una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
          disabled={loading}
        />
      </div>

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
    </form>
  );
};
