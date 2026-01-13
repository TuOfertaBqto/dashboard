import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { useEffect, useState } from "react";
import type { UserRole } from "../api/user";
import { useNavigate } from "react-router-dom";
import { InventoryApi } from "../api/inventory";
import { RequestedCard } from "../components/RequestedCard";
import { ContractProductApi } from "../api/contract-product";
import { ContractApi, type Contract } from "../api/contract";
import { useRequests } from "../contexts/requests/useRequests";
import { InstallmentModal } from "../components/InstallmentModal";

export default function RequestedContractsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractSelected, setContractSelected] = useState<Contract>();

  const { refreshRequestsCount } = useRequests();

  const fetchRequestedContracts = async (isFirstTime = false) => {
    if (isFirstTime) setLoading(true);
    try {
      const data = await ContractApi.getRequested();
      setContracts(data);
    } catch (err) {
      console.error("Error al cargar contratos solicitados:", err);
    } finally {
      if (isFirstTime) {
        setLoading(false);
        setFirstLoad(false);
      }
    }
  };

  useEffect(() => {
    fetchRequestedContracts(true);
  }, []);

  const handleApprove = async (id: string): Promise<Contract> => {
    const t = toast.loading("Aprobando solicitud...");

    try {
      const contractApproved = await ContractApi.update(id, {
        status: "approved",
      });

      await Promise.all(
        contractApproved.products.map(async (p) => {
          const [toDesp, stock] = await Promise.all([
            ContractProductApi.getToDispatchQuantity(p.product.id),
            InventoryApi.getStockByProductId(p.product.id),
          ]);
          const status =
            stock >= p.quantity + toDesp ? "to_dispatch" : "to_buy";
          await ContractProductApi.updateProducts(p.id, status);
        })
      );

      await Promise.all([fetchRequestedContracts(), refreshRequestsCount()]);

      toast.success(`Solicitud #${contractApproved.code} aprobada`, { id: t });

      return contractApproved;
    } catch (err) {
      console.error(err);
      toast.error("No se pudo aprobar", { id: t });
      throw err;
    }
  };

  const handleCancel = async (id: string): Promise<Contract> => {
    const contractCanceled = await ContractApi.update(id, {
      status: "canceled",
    });

    await Promise.all([fetchRequestedContracts(), refreshRequestsCount()]);

    return contractCanceled;
  };

  const handleDelete = async (id: string): Promise<void> => {
    await ContractApi.remove(id);
    await Promise.all([fetchRequestedContracts(), refreshRequestsCount()]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Solicitudes de contratos</h1>
        {user?.role == "vendor" && (
          <button
            onClick={() => navigate("new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Crear solicitud
          </button>
        )}
      </div>

      {loading && firstLoad ? (
        <p className="text-gray-500 text-center">Cargando contratos...</p>
      ) : contracts.length === 0 ? (
        <p className="text-gray-500 text-center">
          No hay solicitudes de contrato
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <RequestedCard
              key={contract.id}
              role={user?.role as UserRole}
              contract={contract}
              onClick={(contract) => {
                setContractSelected(contract);
                setIsModalOpen(true);
              }}
              onApprove={(id) => handleApprove(id)}
              onCancel={(id) => handleCancel(id)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>
      )}

      <InstallmentModal
        open={isModalOpen}
        isRequest
        onClose={() => setIsModalOpen(false)}
        contract={contractSelected}
      />
    </div>
  );
}
