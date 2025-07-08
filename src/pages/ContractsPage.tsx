import { useEffect, useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import { ContractTable } from "../components/ContractTable";
import { ContractApi, type Contract } from "../api/contract";
import { useNavigate } from "react-router-dom";

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );

  const fetchContracts = async () => {
    const data = await ContractApi.getAll();
    console.log("Fetched contracts:", data);
    setContracts(data);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleDelete = async () => {
    if (!contractToDelete) return;
    await ContractApi.remove(contractToDelete.id);
    fetchContracts();
    setContractToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <button
          onClick={() => navigate("/contracts/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear contrato
        </button>
      </div>

      <ContractTable
        contracts={contracts}
        onEdit={(contract) => navigate(`/contracts/${contract.id}/edit`)}
        onDelete={(id) => {
          const selected = contracts.find((c) => c.id === id);
          if (selected) setContractToDelete(selected);
        }}
      />

      <ConfirmModal
        open={!!contractToDelete}
        title="Eliminar contrato"
        message={`¿Estás seguro que deseas eliminar el contrato "${contractToDelete?.code}"?`}
        onCancel={() => setContractToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
