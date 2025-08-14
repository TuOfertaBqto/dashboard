import { useEffect, useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import { ContractTable } from "../components/ContractTable";
import { ContractApi, type Contract } from "../api/contract";
import { useNavigate } from "react-router-dom";
import { InventoryMovApi } from "../api/inventory-movement";
import {
  ContractPaymentApi,
  type ContractPayment,
} from "../api/contract-payment";
import { InstallmentModal } from "../components/InstallmentModal";

export default function ContractsPage() {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

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

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await ContractApi.getAll();
      setContracts(data);
    } catch (err) {
      console.log("Error loading contract", err);
    } finally {
      setLoading(false);
    }
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
        startContract: contractToDispatch.startDate.split("T")[0],
        products: contractToDispatch.products.map((p) => ({
          price: p.product.price,
          installmentAmount: p.product.installmentAmount,
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <button
          onClick={() => navigate("/contracts/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Crear contrato
        </button>
      </div>

      <ContractTable
        contracts={contracts}
        loading={loading}
        onEdit={(contract) => navigate(`/contracts/${contract.id}/edit`)}
        onDelete={(id) => {
          const selected = contracts.find((c) => c.id === id);
          if (selected) setContractToDelete(selected);
        }}
        onDispatch={(contract) => setContractToDispatch(contract)}
        onRowClick={handleRowClick}
      />

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
        title="Despachar contrato"
        message={`¿Deseas despachar el contrato "${contractToDispatch?.code}"? Esto asignará la fecha de inicio como la fecha actual.`}
        onCancel={() => setContractToDispatch(null)}
        onConfirm={handleDispatch}
      />
    </div>
  );
}
