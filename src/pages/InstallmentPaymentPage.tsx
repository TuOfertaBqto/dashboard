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
  const [loading, setLoading] = useState(false);
  //const [, setPhoto] = useState<File | null>(null);

  const [form, setForm] = useState<UpdateContractPayment>({
    contract: "",
    amountPaid: 0,
    paymentMethod: "cash",
    referenceNumber: "",
    paidAt: new Date().toISOString().slice(0, 10),
    owner: "",
    photo: "",
  });

  useEffect(() => {
    if (id) {
      ContractPaymentApi.getById(id)
        .then((data) => {
          setPayment(data);

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
    if (name === "amountPaid") {
      if (
        value === "" ||
        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
      ) {
        setForm((prev) => ({
          ...prev,
          [name]: value === "" ? "" : parseFloat(value),
        }));
      }
      return;
    }

    if (name === "referenceNumber") {
      const intValue = parseInt(value, 10);

      if (value === "" || (!isNaN(intValue) && intValue > 0)) {
        setForm((prev) => ({
          ...prev,
          [name]: value === "" ? "" : intValue,
        }));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setPhoto(file);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: UpdateContractPayment = {
      ...form,
      photo: null,
      referenceNumber: form.referenceNumber || undefined,
      owner: form.owner || undefined,
    };

    // If photo upload is supported, handle it separately in the API or add logic here
    // Otherwise, ignore photo for now

    try {
      await ContractPaymentApi.update(id!, {
        paymentMethod: payload.paymentMethod,
        referenceNumber: payload.referenceNumber,
        amountPaid: payload.amountPaid,
        paidAt: payload.paidAt,
        owner: payload.owner,
      });
      navigate("/installments");
    } catch (error) {
      console.error("Error al registrar pago:", error);
    } finally {
      setLoading(false);
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
        Monto a pagar: ${payment.installmentAmount - (payment.amountPaid ?? 0)}
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
            min="0.01"
            step="0.01"
            value={form.amountPaid}
            onChange={handleChange}
            className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            required
            onWheel={(e) => e.currentTarget.blur()}
            inputMode="decimal"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Método de pago</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod || ""}
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
            onWheel={(e) => e.currentTarget.blur()}
            min={1}
            step={1}
            required={form.paymentMethod !== "cash"}
            className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
            min="2025-05-01"
            max={new Date().toISOString().split("T")[0]}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* <div>
          <label className="block text-sm mb-1">Comprobante (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div> */}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/installments")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading ? "Guardando..." : "Guardar pago"}
          </button>
        </div>
      </form>
    </div>
  );
};
