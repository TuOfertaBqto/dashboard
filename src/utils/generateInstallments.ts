import type { Contract } from "../api/contract";
import type { Installment } from "../api/installment";

function getNextSaturday(
  fromDate: string | Date,
  type: "weekly" | "fortnightly",
  isFirst = false
): Date {
  const date =
    typeof fromDate === "string"
      ? new Date(fromDate + "T00:00:00")
      : new Date(fromDate);

  const day = date.getDay();
  const diff = day === 6 ? 7 : 6 - day;

  const offset = type === "fortnightly" && !isFirst ? diff + 7 : diff;

  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);

  return date;
}

export function getNextFortnight(fromDate: string | Date): Date {
  const date =
    typeof fromDate === "string"
      ? new Date(fromDate + "T00:00:00")
      : new Date(fromDate);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const fifteenth = new Date(year, month, 15, 0, 0, 0, 0);

  const lastOfMonth = new Date(year, month + 1, 0, 0, 0, 0, 0);

  let nextDate: Date;

  if (day < 15) {
    nextDate = fifteenth;
  } else if (day >= 15 && day < lastOfMonth.getDate()) {
    nextDate = lastOfMonth;
  } else {
    nextDate = new Date(year, month + 1, 15, 0, 0, 0, 0);
  }

  return nextDate;
}

export function generateInstallmentsFromContract(
  contract: Contract
): Installment[] {
  const payments: Installment[] = [];

  const remainingProducts = contract.products.map((p) => {
    let adjustedInstallment = p.installmentAmount * p.quantity;

    if (
      contract.agreement === "fortnightly" ||
      contract.agreement === "fifteen_and_last"
    ) {
      adjustedInstallment *= 2;
    }

    const totalCost = p.price * p.quantity;

    return {
      remainingBalance: totalCost,
      adjustedInstallment,
    };
  });

  let dueDateTemp = new Date();
  let isFirst = true;

  while (remainingProducts.some((p) => p.remainingBalance > 0)) {
    let periodPayment = 0;

    remainingProducts.forEach((p) => {
      if (p.remainingBalance > 0) {
        if (p.remainingBalance >= p.adjustedInstallment) {
          periodPayment += p.adjustedInstallment;
          p.remainingBalance -= p.adjustedInstallment;
        } else {
          periodPayment += p.remainingBalance;
          p.remainingBalance = 0;
        }
      }
    });

    const dueDate =
      contract.agreement === "fifteen_and_last"
        ? getNextFortnight(dueDateTemp)
        : getNextSaturday(dueDateTemp, contract.agreement, isFirst);

    payments.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      contract,
      dueDate: dueDate.toISOString(),
      debt: payments.length === 0 ? contract.totalPrice.toString() : undefined,
      installmentAmount: periodPayment,
      installmentPayments: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
          payment: {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            type: null,
            referenceNumber: 0,
            photo: null,
            owner: "",
            amount: "0",
            paidAt: "",
          },
          amount: "",
        },
      ],
    });

    dueDateTemp = dueDate;
    isFirst = false;
  }

  return payments;
}
