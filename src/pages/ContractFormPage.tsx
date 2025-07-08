import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContractApi,
  type Contract,
  type CreateContract,
} from "../api/contract";
import { ContractForm } from "../components/ContractForm";

export default function ContractFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Contract | null>(null);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      ContractApi.getById(id!).then(setInitialData);
    }
  }, [id, isEdit]);

  const handleSubmit = async (data: CreateContract) => {
    try {
      if (isEdit) {
        await ContractApi.update(id!, data);
      } else {
        await ContractApi.create(data);
      }
      navigate("/contracts");
    } catch (err) {
      console.error("Error guardando contrato", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Editar contrato" : "Crear contrato"}
      </h1>
      <ContractForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
