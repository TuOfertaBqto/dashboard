import { useEffect, useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import { ContractTable } from "../components/ContractTable";
import { ContractApi, type Contract } from "../api/contract";
import { useNavigate } from "react-router-dom";
import { InventoryMovApi } from "../api/inventory-movement";
import { ContractPaymentApi } from "../api/contract-payment";

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );
  const [contractToDispatch, setContractToDispatch] = useState<Contract | null>(
    null
  );

  const fetchContracts = async () => {
    const data = await ContractApi.getAll();
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

  const handleDispatch = async () => {
    if (!contractToDispatch) return;

    try {
      await ContractApi.update(contractToDispatch.id, {
        startDate: contractToDispatch.startDate,
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

        await ContractApi.updateProducts(p.id, "dispatched");
      }

      // TODO: Crear los contract Payments
      await ContractPaymentApi.create({
        contractId: contractToDispatch.id,
        agreementContract: contractToDispatch.agreement,
        installmentAmountContract: contractToDispatch.installmentAmount,
        startContract: contractToDispatch.startDate.split("T")[0],
        totalPriceContract: contractToDispatch.totalPrice,
      });

      fetchContracts();

      console.log("Despachando contrato:", contractToDispatch);
    } catch (error) {
      console.error("Error al despachar contrato:", error);
    } finally {
      setContractToDispatch(null);
    }
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
        onDispatch={(contract) => setContractToDispatch(contract)}
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
        title="Despachar contrato"
        message={`¿Deseas despachar el contrato "${contractToDispatch?.code}"? Esto asignará la fecha de inicio como la fecha actual.`}
        onCancel={() => setContractToDispatch(null)}
        onConfirm={handleDispatch}
      />
    </div>
  );
}
