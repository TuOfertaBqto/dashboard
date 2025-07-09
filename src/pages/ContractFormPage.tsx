import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContractApi,
  type Contract,
  type CreateContract,
} from "../api/contract";
import { ContractForm } from "../components/ContractForm";
import { userApi, type User } from "../api/user";

export default function ContractFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [vendors, setVendors] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorRes, customerRes] = await Promise.all([
          userApi.getAll("vendor"),
          userApi.getAll("customer"),
        ]);

        setVendors(vendorRes);
        setCustomers(customerRes);

        if (id) {
          const contractRes = await ContractApi.getById(id);
          setContract(contractRes);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (data: CreateContract) => {
    try {
      if (id) {
        await ContractApi.update(id, data);
      } else {
        await ContractApi.create(data);
      }
      navigate("/contracts");
    } catch (err) {
      console.error("Error guardando contrato", err);
    }
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-6">
        {id ? `Editar contrato C#${contract?.code}` : "Crear contrato"}
      </h1>
      <ContractForm
        initialData={contract}
        onSubmit={handleSubmit}
        vendors={vendors}
        customers={customers}
      />
    </div>
  );
}
