import dayjs from "dayjs";
import { toast } from "sonner";
import { userApi } from "../api/user";
import { InstallmentApi } from "../api/installment";
import { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import { useNavigate, useParams } from "react-router-dom";
import { ContractTable } from "../components/ContractTable";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { InventoryMovApi } from "../api/inventory-movement";
import { ContractProductApi } from "../api/contract-product";
import { ContractApi, type Contract } from "../api/contract";
import { InstallmentModal } from "../components/InstallmentModal";
import { ProductDetailsApi } from "../api/product-details";

interface ContractsPageProps {
  mode: "vendor" | "status";
}
interface Details {
  id: string;
  name: string;
  cpId: {
    id: string;
  };
  serialNumber: string;
  isNew: boolean;
}

export default function ContractsPage({ mode }: ContractsPageProps) {
  const { id, status } = useParams();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null,
  );
  const [contractToDispatch, setContractToDispatch] = useState<Contract | null>(
    null,
  );
  const [contractSelected, setContractSelected] = useState<Contract>();
  const [dispatchDate, setDispatchDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [productsDetails, setProductsDetails] = useState<Details[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageTitle, setPageTitle] = useState<string>("Contratos");

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      let data: Contract[] = [];
      let title = "Contratos";

      if (mode === "vendor" && id) {
        const userData = await userApi.getById(id);

        if (!userData.id) {
          setContracts([]);
          setPageTitle("El usuario no existe");
          return;
        }
        data = await ContractApi.getAllByVendor(id);
        title = `Contratos de T${userData.code} ${userData.firstName} ${userData.lastName}`;
      } else if (mode === "status" && status) {
        // Definimos los estados válidos
        const validStatusMap: Record<
          string,
          {
            apiStatus: "canceled" | "pending" | "approved";
            type?: "to_dispatch" | "dispatched" | "completed";
            title: string;
          }
        > = {
          active: {
            apiStatus: "approved",
            type: "dispatched",
            title: "Contratos activos",
          },
          "to-dispatch": {
            apiStatus: "approved",
            type: "to_dispatch",
            title: "Contratos por despachar",
          },
          canceled: {
            apiStatus: "canceled",
            title: "Contratos cancelados",
          },
          completed: {
            apiStatus: "approved",
            type: "completed",
            title: "Contratos finalizados",
          },
        };

        const config = validStatusMap[status.toLowerCase()];

        if (config) {
          data = await ContractApi.getAllByStatus(
            config.apiStatus,
            config.type,
          );
          title = config.title;
        } else {
          data = [];
          title = "Estado de contrato no válido";
        }
      }

      setContracts(data);
      setPageTitle(title);
    } catch (err) {
      console.log("Error loading contract", err);
      toast.error("No se pudieron cargar los contratos");
      setContracts([]);
      setPageTitle("El usuario no existe o no se pudo cargar");
    } finally {
      setLoading(false);
    }
  }, [mode, id, status]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleDelete = async () => {
    if (!contractToDelete) return;
    try {
      await ContractApi.remove(contractToDelete.id);
      fetchContracts();

      toast.success(
        `Contrato C#${contractToDelete.code} eliminado correctamente`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el contrato");
    } finally {
      setContractToDelete(null);
    }
  };

  const handleDispatch = async () => {
    if (!contractToDispatch) return;

    setSubmitted(true);

    const hasEmptySerials = productsDetails.some(
      (item) => !item.serialNumber.trim(),
    );

    if (hasEmptySerials) {
      toast.error("Todos los productos deben tener un número de serie.");
      return;
    }

    try {
      await ContractApi.update(contractToDispatch.id, {
        startDate: dispatchDate,
      });
      for (const p of contractToDispatch.products) {
        if (p.status === "to_buy") {
          await InventoryMovApi.create({
            productId: p.product.id,
            quantity: p.quantity,
            type: "in",
          });
        }

        await InventoryMovApi.create({
          productId: p.product.id,
          quantity: p.quantity,
          type: "out",
        });

        await ContractProductApi.updateProducts(p.id, "dispatched");
      }

      // TODO: Crear los contract Payments
      await InstallmentApi.create({
        contractId: contractToDispatch.id,
        agreementContract: contractToDispatch.agreement,
        startContract: dispatchDate,
        products: contractToDispatch.products.map((p) => ({
          price: p.price,
          installmentAmount: p.installmentAmount,
          quantity: p.quantity,
        })),
      });

      const data = productsDetails.map((item) => ({
        cpId: item.cpId,
        serialNumber: item.serialNumber,
        isNew: item.isNew,
      }));

      await ProductDetailsApi.create({
        items: data,
      });

      fetchContracts();
      toast.success(
        `Contrato C#${contractToDispatch.code} despachado con éxito`,
      );
    } catch (error) {
      console.error("Error al despachar contrato:", error);
      toast.error(
        `Error al despachar el contrato C#${contractToDispatch.code}`,
      );
    } finally {
      setContractToDispatch(null);
    }
  };

  const updateContract = async () => {
    if (!contractSelected) return;
    const updatedContract = await ContractApi.getById(contractSelected.id);
    setContractSelected(updatedContract);
    setContracts((prevContracts) =>
      prevContracts.map((c) =>
        c.id === updatedContract.id ? updatedContract : c,
      ),
    );
  };

  const handleProductChange = (
    id: string,
    field: "serialNumber" | "isNew",
    value: string | boolean,
  ) => {
    setProductsDetails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <div className="space-y-6">
      {!loading ? (
        <>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow-sm transition cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              {pageTitle}
            </h1>
          </div>

          <ContractTable
            contracts={contracts}
            loading={loading}
            mode={mode}
            onEdit={(contract) => navigate(`/contracts/${contract.id}/edit`)}
            onDelete={(id) => {
              const selected = contracts.find((c) => c.id === id);
              if (selected) setContractToDelete(selected);
            }}
            onDispatch={(contract) => {
              let counter = 0;
              const result = contract.products.flatMap((item) =>
                Array.from({ length: item.quantity }, () => ({
                  id: `temp-${++counter}`,
                  cpId: {
                    id: item.id,
                  },
                  serialNumber: "",
                  isNew: true,
                  name: item.product.name,
                })),
              );
              setProductsDetails(result);
              setContractToDispatch(contract);
            }}
            onRowClick={(contract) => {
              setContractSelected(contract);
              setIsModalOpen(true);
            }}
          />
        </>
      ) : (
        <p className="py-6 text-gray-400">Cargando...</p>
      )}
      <InstallmentModal
        open={isModalOpen}
        isRequest={false}
        onClose={() => setIsModalOpen(false)}
        updateContract={updateContract}
        contract={contractSelected}
      />

      <ConfirmModal
        open={!!contractToDelete}
        title="Eliminar contrato"
        message={`¿Estás seguro que deseas eliminar el contrato C#${contractToDelete?.code}?`}
        onCancel={() => setContractToDelete(null)}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={!!contractToDispatch}
        title={`Despachar contrato C#${contractToDispatch?.code}`}
        message={
          <div className="flex flex-col gap-6">
            {/* Fecha de despacho */}
            <div className="flex flex-col w-full">
              <label
                htmlFor="dispatchDate"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Selecciona la fecha del despacho
                </h3>
              </label>

              <input
                type="date"
                id="dispatchDate"
                name="dispatchDate"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dispatchDate}
                required
                min="2025-05-01"
                max={dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setDispatchDate(e.target.value)}
              />
            </div>

            {/* Productos */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Información de los productos
              </h3>

              {productsDetails.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="mb-4">
                    <p className="font-medium text-gray-900">{item.name}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Serial */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Número de serie
                      </label>

                      <input
                        type="text"
                        value={item.serialNumber}
                        onChange={(e) =>
                          handleProductChange(
                            item.id,
                            "serialNumber",
                            e.target.value,
                          )
                        }
                        className={`border rounded-md px-3 py-2 text-sm ${
                          submitted && !item.serialNumber.trim()
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Ingrese el número de serie"
                      />
                      {submitted && !item.serialNumber.trim() && (
                        <span className="text-xs text-red-500 mt-1">
                          El número de serie es obligatorio
                        </span>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Estado del producto
                      </label>

                      <select
                        value={item.isNew ? "true" : "false"}
                        onChange={(e) =>
                          handleProductChange(
                            item.id,
                            "isNew",
                            e.target.value === "true",
                          )
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="true">Nuevo</option>
                        <option value="false">Reacondicionado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        onCancel={() => {
          setContractToDispatch(null);
          setSubmitted(false);
          setDispatchDate(dayjs().format("YYYY-MM-DD"));
        }}
        onConfirm={handleDispatch}
      />
    </div>
  );
}
