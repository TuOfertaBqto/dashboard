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
  const [, setLoading] = useState<boolean>(false);

  const fetchRequestedContracts = async () => {
    setLoading(true);
    try {
      const data = await ContractApi.getRequested();
      setContracts(data);
    } catch (err) {
      console.error("Error al cargar contratos solicitados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestedContracts();
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
        <button
          onClick={() => navigate("new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Crear solicitud
        </button>
      </div>

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
    </div>
  );
}
