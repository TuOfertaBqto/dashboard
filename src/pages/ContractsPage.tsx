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
import { userApi, type User } from "../api/user";

export default function ContractsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [user, setUser] = useState<User>();
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
    if (!id) return;
    setLoading(true);
    try {
      const data = await ContractApi.getAllByVendor(id);
      const userData = await userApi.getById(id);
      setContracts(data);
      setUser(userData);
    } catch (err) {
      console.log("Error loading contract", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
            {/* <h1 className="text-2xl font-bold text-center sm:text-left"></h1> */}
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Contratos{" "}
              {user
                ? `de T${user.code} ${user.firstName} ${user.lastName}`
                : ""}
            </h1>
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
