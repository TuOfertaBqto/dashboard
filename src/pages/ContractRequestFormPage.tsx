import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContractApi,
  type Contract,
  type CreateContractRequest,
} from "../api/contract";
import { userApi, type User } from "../api/user";
import { ProductApi, type Product } from "../api/product";
import Select from "react-select";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

export default function ContractRequestFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  const [form, setForm] = useState<CreateContractRequest>({
    customerId: "",
    requestDate: dayjs().format("YYYY-MM-DD"),
    agreement: "weekly",
    installmentAmount: 0,
    products: [],
    totalPrice: 0,
  });

  const [customers, setCustomers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [initialData, setInitialData] = useState<Contract | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custs, prods] = await Promise.all([
          userApi.getAll("customer"),
          ProductApi.getAll(),
        ]);

        setCustomers(custs);
        setProducts(prods);

        if (isEdit && id) {
          const contract = await ContractApi.getById(id);
          setInitialData(contract);
          setForm({
            customerId: contract.customerId.id,
            installmentAmount: contract.installmentAmount,
            agreement: contract.agreement,
            requestDate: contract.requestDate,
            totalPrice: contract.totalPrice,
            products: contract.products.map((p) => ({
              productId: p.product.id,
              quantity: p.quantity,
            })),
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id, isEdit]);

  useEffect(() => {
    const newTotal = form.products.reduce((acc, p) => {
      const prod = products.find((prod) => prod.id === p.productId);
      if (prod && p.quantity > 0) {
        return acc + prod.price * p.quantity;
      }
      return acc;
    }, 0);

    setForm((prev) => ({ ...prev, totalPrice: newTotal }));
  }, [form.products, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    const hasValidProduct = form.products.some(
      (p) => p.productId && p.quantity > 0
    );

    if (!hasValidProduct) {
      alert("Debe agregar al menos un producto válido al contrato.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit && id) {
        const { agreement, customerId, totalPrice } = form;
        await ContractApi.update(id, {
          agreement,
          customerId,
          totalPrice,
        });
      } else {
        await ContractApi.create(form);
      }
      navigate("/requests");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {isEdit
          ? "Editar solicitud de contrato"
          : "Nueva solicitud de contrato"}
      </h1>

      <div className="bg-white rounded shadow p-6 space-y-6">
        <label className="block text-sm mb-1">Cliente</label>
        <Select
          options={customers.map((c) => ({ value: c.id, label: c.firstName }))}
          value={
            customers
              .map((c) => ({ value: c.id, label: c.firstName }))
              .find((opt) => opt.value === form.customerId) || null
          }
          onChange={(selected) =>
            setForm({ ...form, customerId: selected?.value || "" })
          }
          placeholder="Selecciona un cliente"
          isClearable
          required
        />

        <div>
          <label htmlFor="agreement" className="block text-sm mb-1">
            Frecuencia de pago
          </label>
          <select
            id="agreement"
            name="agreement"
            value={form.agreement ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                agreement: e.target.value as "weekly" | "fortnightly",
              })
            }
            className="w-full border p-2 rounded"
            required
          >
            <option value="weekly">Semanal</option>
            <option value="fortnightly">Quincenal</option>
          </select>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded shadow p-6 space-y-6 my-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Productos del contrato
        </h3>

        {form.products.map((p, index) => {
          const selected = products.find((prod) => prod.id === p.productId);

          return (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4"
            >
              {/* Producto */}
              <div className="md:col-span-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Producto
                </label>
                <Select
                  value={
                    products
                      .map((prod) => ({ value: prod.id, label: prod.name }))
                      .find((opt) => opt.value === p.productId) || null
                  }
                  onChange={(selected) => {
                    const updated = [...form.products];
                    updated[index].productId = selected?.value || "";
                    setForm({ ...form, products: updated });
                  }}
                  options={products.map((prod) => ({
                    value: prod.id,
                    label: prod.name,
                  }))}
                  placeholder="Seleccione un producto"
                  isClearable
                  isDisabled={!!initialData?.id}
                  required
                />
              </div>

              {/* Cantidad */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={`w-full border p-2 rounded ${
                    isEdit ? "bg-gray-100 cursor-not-allowed" : ""
                  } `}
                  value={p.quantity === 0 ? "" : p.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    const intValue = parseInt(value, 10);
                    const updated = [...form.products];
                    updated[index].quantity = isNaN(intValue) ? 0 : intValue;
                    setForm({ ...form, products: updated });
                  }}
                  required
                  readOnly={!!initialData?.id}
                />
              </div>

              {/* Precio unitario */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Precio unitario ($)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded bg-gray-100"
                  value={selected?.price ?? 0}
                  readOnly
                />
              </div>

              {/* Cuota semanal */}
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">
                  Cuota semanal ($)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded bg-gray-100"
                  value={selected?.installmentAmount ?? 0}
                  readOnly
                />
              </div>

              {/* Botón eliminar */}
              <div className="md:col-span-1 flex justify-center md:pt-6">
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...form.products];
                    updated.splice(index, 1);
                    setForm({ ...form, products: updated });
                  }}
                  className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-full"
                  title="Eliminar producto"
                  disabled={!!initialData?.id}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}

        <div className="text-right text-lg font-semibold">
          Total: ${form.totalPrice.toFixed(2)}
        </div>

        {/* Botón agregar producto */}
        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
            onClick={() =>
              setForm({
                ...form,
                products: [
                  ...form.products,
                  { productId: "", quantity: 1, status: "to_buy" },
                ],
              })
            }
            disabled={!!initialData?.id}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Agregar un producto</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => navigate("/requests")}
          className={`px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400  ${
            loading ? "cursor-not-allowed" : "cursor-pointer"
          }`}
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
}
