import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  HandThumbUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useMemo, useState, type JSX } from "react";
import { PaymentReportPDF } from "../pdf/PaymentReportPDF";

const paymentConfig: Record<
  string,
  { icon: JSX.Element; bgColor: string; label: string }
> = {
  zelle: {
    icon: <CreditCardIcon className="w-6 h-6 text-purple-600" />,
    bgColor: "bg-purple-50",
    label: "Zelle",
  },
  paypal: {
    icon: <CurrencyDollarIcon className="w-6 h-6 text-blue-500" />,
    bgColor: "bg-blue-50",
    label: "PayPal",
  },
  binance: {
    icon: <CurrencyDollarIcon className="w-6 h-6 text-yellow-500" />,
    bgColor: "bg-yellow-50",
    label: "Binance",
  },
  mobile_payment: {
    icon: <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />,
    bgColor: "bg-green-50",
    label: "Pago Móvil",
  },
  bank_transfer: {
    icon: <BuildingLibraryIcon className="w-6 h-6 text-gray-600" />,
    bgColor: "bg-gray-50",
    label: "Transferencia",
  },
  cash: {
    icon: <BanknotesIcon className="w-6 h-6 text-green-700" />,
    bgColor: "bg-emerald-50",
    label: "Efectivo",
  },
  discount: {
    icon: <InformationCircleIcon className="w-6 h-6 text-red-500" />,
    bgColor: "bg-red-50",
    label: "Descuento",
  },
  payment_agreement: {
    icon: <HandThumbUpIcon className="w-6 h-6 text-orange-500" />,
    bgColor: "bg-orange-50",
    label: "Acuerdo de Pago",
  },
};

interface PaymentSummaryProps {
  payments: { type: string; total: number; count: number }[];
  initialStart: string;
  initialEnd: string;
  onFetch: (start: string, end: string) => Promise<void>;
}

export const SummaryPayment = ({
  payments,
  initialStart,
  initialEnd,
  onFetch,
}: PaymentSummaryProps) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportDocument = useMemo(
    () => <PaymentReportPDF payments={payments} start={start} end={end} />,
    [payments, start, end]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!start || !end) {
        setError("La fecha de inicio y final no pueden ser vacías.");
        return;
      }

      if (new Date(start) > new Date(end)) {
        setError("La fecha de inicio no puede ser mayor que la fecha final.");
        return;
      }

      setError(null);
      setLoading(true);
      try {
        await onFetch(start, end);
      } catch (err) {
        console.error(err);
        setError("Error al actualizar los pagos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [start, end, onFetch]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Resumen de Pagos
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 min-w-[60px]">
                Desde
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="flex-1 sm:w-auto p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 min-w-[60px]">
                Hasta
              </label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="flex-1 sm:w-auto p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <PDFDownloadLink
            document={reportDocument}
            fileName={`reporte-pagos-${start}-a-${end}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <button
                disabled={loading || !!error || pdfLoading}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto
        ${
          loading || error || pdfLoading
            ? "bg-blue-400 cursor-not-allowed opacity-70"
            : "bg-blue-600 cursor-pointer hover:bg-blue-700"
        }`}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {loading
                    ? "Actualizando..."
                    : pdfLoading
                    ? "Generando PDF..."
                    : "Descargar"}
                </span>
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="w-full overflow-x-auto pb-3">
        <div className="inline-flex gap-5 w-full">
          {payments.map((p, i) => {
            const config = paymentConfig[p.type] || {
              icon: <CurrencyDollarIcon className="w-6 h-6 text-gray-500" />,
              bgColor: "bg-gray-50",
              label: p.type,
            };

            return (
              <div
                key={i}
                className={`flex-shrink-0 w-64 p-5 shadow-md rounded-xl transition duration-300 hover:shadow-lg ${config.bgColor} border border-gray-100`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-medium text-gray-700">
                    {config.label}
                  </h4>
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    {config.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    ${p.total}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{p.count} pagos</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
