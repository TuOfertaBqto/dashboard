import { useEffect, useState } from "react";
import type { CreateProduct, Product } from "../api/product";
import type { Category } from "../api/category";
import { useNavigate, useParams } from "react-router-dom";
import { InventoryApi } from "../api/inventory";
import { useAuth } from "../auth/useAuth";

interface Props {
  initialData?: Product;
  onSubmit: (data: CreateProduct) => Promise<void>;
  categories: Category[];
}

export const ProductForm = ({ initialData, onSubmit, categories }: Props) => {
  const { id } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState<CreateProduct>({
    name: "",
    description: null,
    installmentAmount: 0,
    price: 0,
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [stock, setStock] = useState<number | "">(0);
  const navigate = useNavigate();
  const [isBCV, setIsBCV] = useState<boolean>(false);
  const [priceUSDT, setPriceUSDT] = useState<number>(0);
  const [priceEUR, setPriceEUR] = useState<number>(0);
  const [weeks, setWeeks] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description || null,
        installmentAmount: initialData.installmentAmount,
        price: initialData.price,
        categoryId: initialData.categoryId.id,
      });
    }

    const fetchStock = async () => {
      try {
        if (id) {
          const stockValue = await InventoryApi.getStockByProductId(id);
          setStock(stockValue);
        }
      } catch (error) {
        console.error("Error al obtener stock:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchStock();
  }, [initialData, id]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        fetch("https://criptoya.com/api/binancep2p/usdt/ves")
          .then((response) => response.json())
          .then((data) => {
            setPriceUSDT(data.ask);
          })
          .catch((error) => console.error("Error:", error));

        fetch("https://api.dolarvzla.com/public/exchange-rate")
          .then((response) => response.json())
          .then((data) => {
            setPriceEUR(data.current.eur);
          })
          .catch((error) => console.error("Error:", error));
      } catch (error) {
        console.error("Error al obtener precio Dolar api:", error);
      }
    };
    fetchPrice();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (["price", "installmentAmount"].includes(name)) {
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
      if (id) {
        await onSubmit({ ...form, stockQuantity: stock ?? undefined });
      } else {
        await onSubmit(form);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (isBCV: boolean, purchasePrice: number) => {
    let salePriceTemp = 0;

    if (isBCV) {
      salePriceTemp = purchasePrice * 2;
    } else {
      salePriceTemp = +(purchasePrice * 2 * (priceUSDT / priceEUR)).toFixed(2);
    }

    const candidates: {
      x: number;
      k: number;
      product: number;
      diff: number;
    }[] = [];
    const ki = salePriceTemp >= 150 ? 15 : 10;

    for (let k = ki; k <= 20; k++) {
      // x debe cumplir: x*k >= n y x múltiplo de 5
      // entonces primero calculamos lo mínimo que debería ser x
      let x = Math.ceil(salePriceTemp / k);

      // pero x debe ser múltiplo de 5 → ajustamos hacia arriba al próximo múltiplo de 5
      if (x % 5 !== 0) {
        x = x + (5 - (x % 5));
      }

      const product = x * k;
      const diff = Math.abs(product - salePriceTemp);

      candidates.push({ x, k, product, diff });
    }

    // elegimos la más cercana
    candidates.sort((a, b) => a.diff - b.diff);

    setWeeks(candidates[0].k);
    setForm((prev) => ({
      ...prev,
      installmentAmount: candidates[0].x,
      price: candidates[0].product,
    }));

    return {
      original: salePriceTemp,
      bestTriad: candidates[0],
      allTriads: candidates, // opcional
    };
  };

  return loadingData ? (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <p className="text-gray-400">Cargando...</p>
    </div>
  ) : (
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

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block mb-1 text-sm">Precio de compra ($)</label>
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            min={1}
            step={1}
            //value={form.purchasePrice}
            onChange={(p) => {
              const value = p.target.value;
              const numericValue = value ? parseFloat(value) : 0;
              const txt = calculatePrice(isBCV, numericValue);
              console.log(txt);
            }}
            className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            required
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>

        {/* RADIO BCV */}
        <div className="flex flex-col gap-2">
          <label className="text-sm mb-1">¿BCV?</label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="isBCV"
                checked={isBCV === true}
                onChange={() => setIsBCV(true)}
              />
              Sí
            </label>

            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="isBCV"
                checked={isBCV === false}
                onChange={() => setIsBCV(false)}
              />
              No
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="price" className="block mb-1 text-sm">
            Precio ($)
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

        <div className="flex-1">
          <label htmlFor="installmentAmount" className="block mb-1 text-sm">
            Semanas
          </label>
          <input
            id="weeks"
            name="weeks"
            type="number"
            min={1}
            step={1}
            value={weeks}
            onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
            className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            required
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>

        <div className="flex-1">
          <label htmlFor="installmentAmount" className="block mb-1 text-sm">
            Cuota semanal ($)
          </label>
          <input
            id="installmentAmount"
            name="installmentAmount"
            type="number"
            min={1}
            step={1}
            value={form.installmentAmount}
            onChange={handleChange}
            className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            required
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      </div>

      {id && user?.role === "main" && (
        <div>
          <label htmlFor="stock" className="block mb-1 text-sm">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            value={stock === 0 ? stock : stock || ""}
            onChange={(e) => {
              const value = e.target.value;
              const intValue = parseInt(value, 10);

              if (
                value === "" ||
                (!isNaN(intValue) &&
                  intValue >= 0 &&
                  value === intValue.toString())
              ) {
                setStock(intValue);
              }
            }}
            className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            required
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => navigate("/products")}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
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
  );
};
