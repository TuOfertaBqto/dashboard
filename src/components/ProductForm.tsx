import { useAuth } from "../auth/useAuth";
import { InventoryApi } from "../api/inventory";
import type { Category } from "../api/category";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CreateProduct, Product } from "../api/product";

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
  const [purchasePrice, setPurchasePrice] = useState<number>(0);

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
            const dataParsed = Math.trunc(data.ask * 100) / 100;
            setPriceUSDT(dataParsed);
          })
          .catch((error) => console.error("Error:", error));

        fetch("https://api.dolarvzla.com/public/exchange-rate")
          .then((response) => response.json())
          .then((data) => {
            const dataParsed = Math.trunc(data.current.eur * 100) / 100;
            setPriceEUR(dataParsed);
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

  function getBestTriad(n: number, minK: number) {
    const candidates = [];

    for (let k = minK; k <= 20; k++) {
      let x = Math.ceil(n / k);
      if (x % 5 !== 0) x += 5 - (x % 5);

      const product = x * k;
      const diff = Math.abs(product - n);

      candidates.push({ x, k, product, diff });
    }

    return candidates.sort((a, b) => a.diff - b.diff)[0];
  }

  const calculatePrice = useCallback(() => {
    if (purchasePrice <= 0) {
      setForm((prev) => ({
        ...prev,
        installmentAmount: 0,
        price: 0,
      }));
      setWeeks(0);
      return;
    }

    const salePrice = isBCV
      ? purchasePrice * 2
      : +(purchasePrice * 2 * (priceUSDT / priceEUR)).toFixed(2);

    const minK = Math.max(1, Math.ceil(Math.min(salePrice / 10, 15)));
    const best = getBestTriad(salePrice, minK);

    setWeeks(best.k);
    setForm((prev) => ({
      ...prev,
      installmentAmount: best.x,
      price: best.product,
    }));
  }, [purchasePrice, isBCV, priceUSDT, priceEUR]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  return loadingData ? (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <p className="text-gray-400">Cargando...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-6 rounded shadow space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-1">
            Información del producto
          </h3>

          <div className="space-y-4">
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
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow space-y-6">
        {/* ===== COTIZACIÓN ===== */}
        <div>
          <div className="mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold">Cotización</h3>

            <p className="text-xs text-gray-500 mt-1">
              EUR: <span className="font-medium text-gray-600">{priceEUR}</span>{" "}
              Bs · USDT:{" "}
              <span className="font-medium text-gray-600">{priceUSDT}</span> Bs
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block mb-1 text-sm">
                  Precio de compra ($)
                </label>
                <input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={purchasePrice || ""}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\D/g, "");
                    const num = sanitized ? Number(sanitized) : 0;
                    if (num > 999999) return;
                    setPurchasePrice(num);
                  }}
                  className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                  Precio de venta ($)
                </label>
                <input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.price || ""}
                  onChange={(e) => {
                    handleChange(e);
                    const sanitized = e.target.value.replace(/\D/g, "");
                    const num = sanitized ? Number(sanitized) : 0;

                    const newWeeks = num > 0 ? num / form.installmentAmount : 0;

                    setWeeks(newWeeks);
                  }}
                  className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  required
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>

              <div className="flex-1">
                <label
                  htmlFor="installmentAmount"
                  className="block mb-1 text-sm"
                >
                  Cuota semanal ($)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="installmentAmount"
                    name="installmentAmount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.installmentAmount || ""}
                    onChange={(e) => {
                      handleChange(e);
                      const sanitized = e.target.value.replace(/\D/g, "");
                      const num = sanitized ? Number(sanitized) : 0;

                      const newWeeks = num > 0 ? form.price / num : 0;

                      setWeeks(newWeeks);
                    }}
                    className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    required
                    onWheel={(e) => e.currentTarget.blur()}
                  />

                  <span className="w-28 shrink-0 flex py-2 text-sm">
                    {weeks > 0
                      ? `x${Number(weeks.toFixed(2))} ${weeks === 1 ? "semana" : "semanas"}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
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
      </div>
    </form>
  );
};
