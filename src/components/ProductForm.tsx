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
    if (["price"].includes(name)) {
      const intValue = parseInt(value, 10);

      if (value === "" || (!isNaN(intValue) && intValue > 0)) {
        setForm((prev) => ({
          ...prev,
          [name]: value === "" ? "" : intValue,
        }));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
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
        <label htmlFor="name" className="block mb-1 text-sm">
          Nombre del producto
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={loading}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 text-sm">
          Descripción
        </label>
        <textarea
          id="description"
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
        <label htmlFor="price" className="block mb-1 text-sm">
          Precio
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min={1}
          step={1}
          value={form.price}
          onChange={handleChange}
          className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          required
          onWheel={(e) => e.currentTarget.blur()}
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
