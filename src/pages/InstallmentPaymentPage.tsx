import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContractPaymentApi,
  type ContractPayment,
  type UpdateContractPayment,
} from "../api/contract-payment";

export const InstallmentPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<ContractPayment | null>(null);
  const [, setPhoto] = useState<File | null>(null);

  const [form, setForm] = useState<UpdateContractPayment>({
    contract: "",
    amountPaid: 0,
    paymentMethod: "cash",
    referenceNumber: 0,
    paidAt: new Date().toISOString().slice(0, 10),
    owner: "",
    photo: "",
  });

  useEffect(() => {
    if (id) {
      ContractPaymentApi.getById(id)
        .then((data) => {
          setPayment(data);
          console.log(data);

          setForm((prev) => ({
            ...prev,
            contract: data.contract.id,
          }));
        })
        .catch(() => navigate("/installments"));
    }
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "referenceNumber" || name === "amountPaid"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UpdateContractPayment = {
      ...form,
      photo: null,
    };

    // If photo upload is supported, handle it separately in the API or add logic here
    // Otherwise, ignore photo for now

    try {
      await ContractPaymentApi.update(id!, {
        paymentMethod: payload.paymentMethod,
        referenceNumber: payload.referenceNumber,
        amountPaid: payload.amountPaid,
        paidAt: payload.paidAt,
      });
      navigate("/installments");
    } catch (error) {
      console.error("Error al registrar pago:", error);
    }
  };

  if (!payment) return <p className="text-gray-600">Cargando cuota...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Registrar pago</h1>
      <p className="text-sm text-gray-600">
        Contrato: C#{payment.contract.code}
      </p>
      <p className="text-sm text-gray-600">
        Monto a pagar: ${payment.contract.installmentAmount}
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block text-sm mb-1">Monto pagado</label>
          <input
            type="number"
            name="amountPaid"
            value={form.amountPaid}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Método de pago</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Seleccione</option>
            <option value="zelle">Zelle</option>
            <option value="binance">Binance</option>
            <option value="paypal">Paypal</option>
            <option value="mobile_payment">Pago móvil</option>
            <option value="bank_transfer">Transferencia</option>
            <option value="cash">Efectivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Referencia</label>
          <input
            type="number"
            name="referenceNumber"
            value={form.referenceNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Titular / Propietario</label>
          <input
            type="text"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Fecha de pago</label>
          <input
            type="date"
            name="paidAt"
            value={form.paidAt}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Comprobante (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/installments")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar pago
          </button>
        </div>
      </form>
    </div>
  );
};
