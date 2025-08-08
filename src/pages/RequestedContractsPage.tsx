import { useEffect, useState } from "react";
import { ContractApi, type Contract } from "../api/contract";
import { RequestedCard } from "../components/RequestedCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../api/user";

export default function RequestedContractsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const fetchRequestedContracts = async (isFirstTime = false) => {
    if (isFirstTime) setLoading(true); // solo mostrar "cargando" si es la primera vez
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
    const contractApproved = await ContractApi.update(id, {
      status: "approved",
    });
    fetchRequestedContracts();
    return contractApproved;
  };

  const handleCancel = async (id: string): Promise<Contract> => {
    const contractCanceled = await ContractApi.update(id, {
      status: "canceled",
    });

    fetchRequestedContracts();

    return contractCanceled;
  };

  const handleDelete = async (id: string): Promise<void> => {
    await ContractApi.remove(id);
    fetchRequestedContracts();
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
              onApprove={(id) => handleApprove(id)}
              onCancel={(id) => handleCancel(id)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
