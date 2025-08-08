import { useEffect, useState } from "react";
import { ContractApi, type Contract } from "../api/contract";
import { RequestedCard } from "../components/RequestedCard";
import { useNavigate } from "react-router-dom";

export default function RequestedContractsPage() {
  const navigate = useNavigate();
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

  const handleCancel = async (id: string) => {
    const contractCanceled = await ContractApi.update(id, {
      status: "canceled",
    });

    fetchRequestedContracts();

    return contractCanceled;
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
            contract={contract}
            onCancel={(id) => handleCancel(id)}
          />
        ))}
      </div>
    </div>
  );
}
