import dayjs from "dayjs";
import {
  InstallmentApi,
  type Installment,
  type UpdateInstallment,
} from "../api/installment";
import { PaymentApi } from "../api/payment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AccountApi, type Account } from "../api/account";
import { toast } from "sonner";

export const InstallmentPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Installment | null>(null);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<Account[]>();
  //const [, setPhoto] = useState<File | null>(null);

  const [form, setForm] = useState<UpdateInstallment>({
    contract: "",
    amountPaid: 0,
    paymentMethod: "cash",
    referenceNumber: "",
    paidAt: dayjs().format("YYYY-MM-DD"),
    owner: "",
    photo: "",
    accountId: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [data, accountData] = await Promise.all([
          InstallmentApi.getById(id),
          AccountApi.getAll(),
        ]);

        setAccount(accountData);
        setPayment(data);

        setForm((prev) => ({
          ...prev,
          contract: data.contract.id,
        }));
      } catch (error) {
        console.error("Error fetching installment:", error);
        navigate(-1);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "paymentMethod") {
      const method = value as UpdateInstallment["paymentMethod"];
      setForm((prev) => ({
        ...prev,
        [name]: method,
        referenceNumber: value === "cash" ? undefined : prev.referenceNumber,
        accountId:
          value === "mobile_payment" || value === "bank_transfer"
            ? prev.accountId
            : undefined,
      }));
      return;
    }

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
    const t = toast.loading("Registrando pago...");

    const payload: UpdateInstallment = {
      ...form,
      photo: null,
      referenceNumber: form.referenceNumber || undefined,
      owner: form.owner,
    };

    // If photo upload is supported, handle it separately in the API or add logic here
    // Otherwise, ignore photo for now

    try {
      await PaymentApi.create(id!, {
        amount: Number(payload.amountPaid),
        owner: payload.owner,
        paidAt: payload.paidAt,
        photo: payload.photo,
        referenceNumber: payload.referenceNumber,
        type: payload.paymentMethod,
        accountId: payload.accountId,
      });

      toast.success("Pago registrado exitosamente", { id: t });
    } catch (error) {
      console.error("Error al registrar pago:", error);
      toast.error("Hubo un error al registrar el pago.", { id: t });
    } finally {
      navigate(-1);
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
        Monto a pagar: $
        {payment.installmentAmount -
          (payment.installmentPayments.reduce(
            (total, ip) => total + Number(ip.amount),
            0
          ) ?? 0)}
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

        {form.paymentMethod !== "cash" && (
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
              required
              className="w-full border p-2 rounded appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Titular / Propietario</label>
          <input
            type="text"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {(form.paymentMethod === "mobile_payment" ||
          form.paymentMethod === "bank_transfer") && (
          <div>
            <label className="block text-sm mb-1">Cuenta</label>
            <select
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Seleccione</option>
              {account?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.owner}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Fecha de pago</label>
          <input
            type="date"
            name="paidAt"
            value={form.paidAt}
            onChange={handleChange}
            min="2025-05-01"
            max={dayjs().format("YYYY-MM-DD")}
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
            onClick={() => navigate(-1)}
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
