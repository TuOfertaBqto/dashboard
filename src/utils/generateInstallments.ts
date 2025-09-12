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
  const payments: ContractPayment[] = [];

  const intervalDays = contract.agreement === "weekly" ? 7 : 14;

  const remainingProducts = contract.products.map((p) => {
    let adjustedInstallment = p.installmentAmount * p.quantity;

    if (contract.agreement === "fortnightly") {
      adjustedInstallment *= 2;
    }

    const totalCost = p.price * p.quantity;

    return {
      remainingBalance: totalCost,
      adjustedInstallment,
    };
  });

  let installmentIndex = 0;

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
    const startDate = new Date(getNextSaturday().toString());
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + installmentIndex * intervalDays);

    payments.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      contract,
      paymentMethod: null,
      referenceNumber: null,
      photo: null,
      owner: null,
      dueDate: dueDate.toISOString(),
      amountPaid: null,
      debt: payments.length === 0 ? contract.totalPrice.toString() : undefined,
      installmentAmount: periodPayment,
    });

    installmentIndex++;
  }

  return payments;
}
