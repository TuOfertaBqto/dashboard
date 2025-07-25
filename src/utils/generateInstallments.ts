import dayjs from "dayjs";
import type { Contract } from "../api/contract";
import type { ContractPayment } from "../api/contract-payment";

function getNextSaturday(): dayjs.Dayjs {
  const today = dayjs();
  const day = today.day();
  const daysToAdd = day === 6 ? 7 : 6 - day;
  return today.add(daysToAdd, "day").startOf("day");
}

export function generateInstallmentsFromContract(
  contract: Contract
): ContractPayment[] {
  const startDate = getNextSaturday();
  const intervalDays = contract.agreement === "fortnightly" ? 14 : 7;

  const total = contract.totalPrice;
  const amount = contract.installmentAmount;
  const numPayments = Math.ceil(total / amount);
  const installments: ContractPayment[] = [];

  let remaining = total;

  for (let i = 0; i < numPayments; i++) {
    const dueDate = startDate.add(i * intervalDays, "day").toISOString();
    const currentAmount = i === numPayments - 1 ? remaining : amount;

    installments.push({
      id: `fake-${i + 1}`,
      dueDate,
      amountPaid: null,
      paymentMethod: null,
      paidAt: undefined,
      debt: i === 0 ? contract.totalPrice.toString() : undefined,
      contract: contract,
      createdAt: dueDate,
      updatedAt: dueDate,
      deletedAt: null,
      referenceNumber: null,
      photo: null,
      owner: null,
    });

    remaining -= currentAmount;
  }

  return installments;
}
