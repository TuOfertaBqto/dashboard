import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContractApi,
  type Contract,
  type CreateContractProduct,
  type CreateContractRequest,
} from "../api/contract";
import { userApi, type User } from "../api/user";
import { ProductApi, type Product } from "../api/product";
import Select from "react-select";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { InstallmentApi } from "../api/installment";
import { useAuth } from "../auth/useAuth";
import { ContractProductApi } from "../api/contract-product";
import { ConfirmModal } from "../components/ConfirmModal";

export default function ContractRequestFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isMain = user?.role !== "main";
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
  const [canRequest, setCanRequest] = useState<boolean>(false);
  const [messageRequest, setMessageRequest] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [indexToRemove, setIndexToRemove] = useState<number>(-1);
  const [isRemoving, setIsRemoving] = useState(false);

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
              id: p.id,
              productId: p.product.id,
              quantity: p.quantity,
              status: p.status,
              price: p.price,
              installmentAmount: p.installmentAmount,
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
      if (p.productId && p.quantity > 0) {
        return acc + (p.price || 0) * p.quantity;
      }
      return acc;
    }, 0);

    setForm((prev) => ({ ...prev, totalPrice: newTotal }));
  }, [form.products]);

  useEffect(() => {
    const fetchValidation = async () => {
      try {
        const validateOverdue = await InstallmentApi.canVendorRequest();
        setCanRequest(validateOverdue);

        if (!validateOverdue) {
          setMessageRequest(
            "No puede realizar una nueva solicitud debido a que tiene el 30% de cuotas atrasadas."
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchValidation();
  }, []);

  const setProductField = <K extends keyof CreateContractProduct>(
    index: number,
    field: K,
    value: CreateContractProduct[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((prod, i) => {
        if (i !== index) return prod;

        const numericFields: (keyof CreateContractProduct)[] = [
          "price",
          "installmentAmount",
        ];

        const newValue: CreateContractProduct[K] = numericFields.includes(field)
          ? (parseFloat(String(value)) as CreateContractProduct[K])
          : value;

        return { ...prod, [field]: newValue };
      }),
    }));
  };

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

    const allProductsHaveValidInstallment = form.products.every((p) => {
      const product = products.find((prod) => prod.id === p.productId);
      return product?.installmentAmount && product.installmentAmount > 0;
    });

    if (!allProductsHaveValidInstallment) {
      alert("Todos los productos deben tener una cuota mayor que cero.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        const { agreement, customerId, totalPrice, products } = form;

        const updatedProducts: CreateContractProduct[] = products.map((p) => ({
          ...p,
          contractId: id,
        }));

        await ContractApi.update(id, {
          agreement,
          customerId,
          totalPrice,
        });

        await ContractProductApi.updateBulk(updatedProducts);
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

  const handleRemoveProduct = async (index: number) => {
    if (indexToRemove === -1) return;

    const product = form.products[index];
    setIsRemoving(true);

    try {
      const updated = [...form.products];
      updated.splice(index, 1);

      const newTotal = updated.reduce((acc, p) => {
        if (p.productId && p.quantity > 0) {
          return acc + (p.price || 0) * p.quantity;
        }
        return acc;
      }, 0);

      if (product.id && id) {
        await ContractProductApi.remove(product.id);

        await ContractApi.update(id, {
          totalPrice: newTotal,
        });
      }

      setForm({ ...form, products: updated });
    } catch (error) {
      console.error("Error eliminando el producto:", error);
    } finally {
      setIsRemoving(false);
      setShowModal(false);
      setIndexToRemove(-1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Encabezado con mensaje */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">
          {isEdit
            ? "Editar solicitud de contrato"
            : "Nueva solicitud de contrato"}
        </h1>
        {messageRequest && (
          <p className="text-red-600 text-sm">{messageRequest}</p>
        )}
      </div>

      {canRequest && (
        <>
          <div className="bg-white rounded shadow p-6 space-y-6">
            <label className="block text-sm mb-1">Cliente</label>
            <Select
              options={customers.map((c) => ({
                value: c.id,
                label: c.firstName,
              }))}
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
              isDisabled={!canRequest}
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
                disabled={!canRequest}
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
                          .map((prod) => ({
                            value: prod.id,
                            label: prod.name,
                            price: prod.price,
                            installmentAmount: prod.installmentAmount,
                          }))
                          .find((opt) => opt.value === p.productId) || null
                      }
                      onChange={(selected) => {
                        setProductField(
                          index,
                          "productId",
                          selected?.value || ""
                        );
                        setProductField(index, "price", selected?.price || 0);
                        setProductField(
                          index,
                          "installmentAmount",
                          selected?.installmentAmount || 0
                        );
                      }}
                      options={products
                        .filter(
                          (prod) =>
                            !form.products.some(
                              (fp, i) => fp.productId === prod.id && i !== index
                            )
                        )
                        .map((prod) => ({
                          value: prod.id,
                          label: prod.name,
                          price: prod.price,
                          installmentAmount: prod.installmentAmount,
                        }))}
                      placeholder="Seleccione un producto"
                      isClearable
                      isDisabled={isMain && (!!initialData?.id || !canRequest)}
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
                      className={`w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        isEdit && isMain ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      onWheel={(e) => e.currentTarget.blur()}
                      value={p.quantity || ""}
                      onChange={(e) => {
                        const intValue = parseInt(e.target.value, 10);
                        setProductField(
                          index,
                          "quantity",
                          isNaN(intValue) ? 0 : intValue
                        );
                      }}
                      required
                      readOnly={isMain && (!!initialData?.id || !canRequest)}
                    />
                  </div>

                  {/* Precio unitario */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Precio unitario ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className={`w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        isMain ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                      onWheel={(e) => e.currentTarget.blur()}
                      value={p.price || ""}
                      onChange={(e) => {
                        if (isMain) return;

                        const floatValue = parseFloat(e.target.value) || 0;
                        setProductField(index, "price", floatValue);
                      }}
                      required
                      readOnly={isMain}
                    />
                  </div>

                  {/* Cuota semanal */}
                  <div className="md:col-span-3">
                    <label className="block text-sm text-gray-600 mb-1">
                      Cuota semanal ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className={`w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        isMain ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                      onWheel={(e) => e.currentTarget.blur()}
                      value={p.installmentAmount || ""}
                      onChange={(e) => {
                        if (isMain) return;

                        const floatValue = parseFloat(e.target.value) || 0;
                        setProductField(index, "installmentAmount", floatValue);
                      }}
                      required
                      readOnly={isMain}
                    />
                  </div>

                  {/* Botón eliminar */}
                  <div className="md:col-span-1 flex justify-center md:pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIndexToRemove(index);
                        setShowModal(true);
                      }}
                      className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-full"
                      title="Eliminar producto"
                      disabled={isRemoving}
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
                      {
                        productId: "",
                        quantity: 1,
                        status: "to_buy",
                        price: 0,
                        installmentAmount: 0,
                      },
                    ],
                  })
                }
                disabled={isMain && (!!initialData?.id || !canRequest)}
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Agregar un producto</span>
              </button>
            </div>
          </div>
        </>
      )}

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
          disabled={loading || !canRequest}
          className={`px-4 py-2 rounded text-white ${
            loading || !canRequest
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <ConfirmModal
        open={showModal}
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar el producto del contrato? Esta acción no se puede deshacer."
        onCancel={() => setShowModal(false)}
        onConfirm={() => handleRemoveProduct(indexToRemove)}
      />
    </form>
  );
}
