import { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import { ContractTable } from "../components/ContractTable";
import { ContractApi, type Contract } from "../api/contract";
import { useNavigate, useParams } from "react-router-dom";
import { InventoryMovApi } from "../api/inventory-movement";
import {
  ContractPaymentApi,
  type ContractPayment,
} from "../api/contract-payment";
import { InstallmentModal } from "../components/InstallmentModal";
import dayjs from "dayjs";
import { ContractProductApi } from "../api/contract-product";
import { userApi } from "../api/user";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface ContractsPageProps {
  mode: "vendor" | "status";
}

export default function ContractsPage({ mode }: ContractsPageProps) {
  const { id, status } = useParams();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );
  const [contractToDispatch, setContractToDispatch] = useState<Contract | null>(
    null
  );
  const [contractSelected, setContractSelected] = useState<Contract | null>(
    null
  );
  const [installments, setInstallments] = useState<ContractPayment[]>([]);
  const [dispatchDate, setDispatchDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageTitle, setPageTitle] = useState<string>("Contratos");

  const handleRowClick = async (contract: Contract) => {
    setContractSelected(contract);
    try {
      const res = await ContractPaymentApi.getAllByContractId(contract.id);

      setInstallments(res);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error al obtener cuotas:", err);
    }
  };

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      let data: Contract[] = [];
      let title = "Contratos";

      if (mode === "vendor" && id) {
        const userData = await userApi.getById(id);
        console.log(userData);

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
            config.type
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
    await ContractApi.remove(contractToDelete.id);
    fetchContracts();
    setContractToDelete(null);
  };

  const handleDispatch = async () => {
    if (!contractToDispatch) return;

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
      await ContractPaymentApi.create({
        contractId: contractToDispatch.id,
        agreementContract: contractToDispatch.agreement,
        startContract: dispatchDate,
        products: contractToDispatch.products.map((p) => ({
          price: p.price,
          installmentAmount: p.installmentAmount,
          quantity: p.quantity,
        })),
      });

      fetchContracts();
    } catch (error) {
      console.error("Error al despachar contrato:", error);
    } finally {
      setContractToDispatch(null);
    }
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
            onDispatch={(contract) => setContractToDispatch(contract)}
            onRowClick={handleRowClick}
          />
        </>
      ) : (
        <p className="py-6 text-gray-400">Cargando...</p>
      )}
      <InstallmentModal
        open={isModalOpen}
        isRequest={false}
        onClose={() => setIsModalOpen(false)}
        payments={installments}
        contract={contractSelected}
      />

      <ConfirmModal
        open={!!contractToDelete}
        title="Eliminar contrato"
        message={`¿Estás seguro que deseas eliminar el contrato "${contractToDelete?.code}"?`}
        onCancel={() => setContractToDelete(null)}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={!!contractToDispatch}
        title={`Despachar contrato #${contractToDispatch?.code}`}
        message={
          <div className="flex flex-col w-full my-3">
            <label
              htmlFor="dispatchDate"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Selecciona la fecha de despacho
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
        }
        onCancel={() => {
          setContractToDispatch(null);
          setDispatchDate(dayjs().format("YYYY-MM-DD"));
        }}
        onConfirm={handleDispatch}
      />
    </div>
  );
}
