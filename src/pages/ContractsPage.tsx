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
import dayjs from "dayjs";
import { DebtsReportPDF } from "../components/DebtsReportPDF";
import { pdf } from "@react-pdf/renderer";
import { ArrowDownTrayIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

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
  const [dispatchDate, setDispatchDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
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

        await ContractApi.updateProducts(p.id, "dispatched");
      }

      // TODO: Crear los contract Payments
      await ContractPaymentApi.create({
        contractId: contractToDispatch.id,
        agreementContract: contractToDispatch.agreement,
        startContract: dispatchDate,
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

  const handleDownloadPDF = async () => {
    const vendors = await ContractPaymentApi.getOverdueCustomersByVendor();

    const blob = await pdf(<DebtsReportPDF vendors={vendors} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const now = dayjs().format("YYYYMMDD_HHmmss");
    link.download = `cuotas_atrasadas_${now}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
        {/* Título */}
        <h1 className="text-2xl font-bold text-center sm:text-left">
          Contratos
        </h1>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/contracts/new")}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition w-full sm:w-auto cursor-pointer"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Crear contrato
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-medium shadow hover:bg-green-700 transition w-full sm:w-auto cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Reporte deudas
          </button>
        </div>
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
