import {
  BanknotesIcon,
  ChartPieIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { GlobalPaymentsTotals } from "../../api/installment";

interface BalanceProps {
  totals: GlobalPaymentsTotals;
}

export const Balance = ({ totals }: BalanceProps) => {
  const cards = [
    {
      key: "totalAmountPaid",
      label: "Total Pagado",
      value: totals.totalAmountPaid,
      bgColor: "bg-green-50",
      icon: <BanknotesIcon className="text-green-600 w-7 h-7" />,
    },
    {
      key: "totalOverdueDebt",
      label: "Deuda Vencida",
      value: totals.totalOverdueDebt,
      bgColor: "bg-red-50",
      icon: <ExclamationTriangleIcon className="text-red-600 w-7 h-7" />,
    },
    {
      key: "totalPendingBalance",
      label: "Saldo Pendiente",
      value: totals.totalPendingBalance,
      bgColor: "bg-yellow-50",
      icon: <ClockIcon className="text-yellow-600 w-7 h-7" />,
    },
    {
      key: "totalDebt",
      label: "Deuda Total",
      value: totals.totalDebt,
      bgColor: "bg-blue-50",
      icon: <ChartPieIcon className="text-blue-600 w-7 h-7" />,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Saldos</h2>
      </div>

      <div className="w-full overflow-x-auto pb-3">
        <div className="inline-flex gap-5 w-full">
          {cards
            .slice()
            .reverse()
            .map((card) => (
              <div
                key={card.key}
                className={`flex-shrink-0 w-64 p-5 shadow-md rounded-xl transition duration-300 hover:shadow-lg ${card.bgColor} border border-gray-100`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-medium text-gray-700">
                    {card.label}
                  </h4>
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    {card.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    $
                    {Number(card.value).toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
