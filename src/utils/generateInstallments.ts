import dayjs from "dayjs";
import type { Contract } from "../api/contract";
import type { ContractPayment } from "../api/contract-payment";

function getNextSaturday(): dayjs.Dayjs {
  const today = dayjs();
  const day = today.day();
  const daysToAdd = day === 6 ? 7 : 6 - day;
  return today.add(daysToAdd, "day").startOf("day");
}

// export function generateInstallmentsFromContract(
//   contract: Contract
// ): ContractPayment[] {
//   const startDate = getNextSaturday();
//   const intervalDays = contract.agreement === "fortnightly" ? 14 : 7;

//   const total = contract.totalPrice;
//   const amount = contract.installmentAmount;
//   const numPayments = Math.ceil(total / amount);
//   const installments: ContractPayment[] = [];

//   let remaining = total;

//   for (let i = 0; i < numPayments; i++) {
//     const dueDate = startDate.add(i * intervalDays, "day").toISOString();
//     const currentAmount = i === numPayments - 1 ? remaining : amount;

//     installments.push({
//       id: `fake-${i + 1}`,
//       dueDate,
//       amountPaid: null,
//       paymentMethod: null,
//       paidAt: undefined,
//       debt: i === 0 ? contract.totalPrice.toString() : undefined,
//       contract: contract,
//       createdAt: dueDate,
//       updatedAt: dueDate,
//       deletedAt: null,
//       referenceNumber: null,
//       photo: null,
//       owner: null,
//     });

//     remaining -= currentAmount;
//   }

//   return installments;
// }

export function generateInstallmentsFromContract(
  contract: Contract
): ContractPayment[] {
  const payments: ContractPayment[] = [];

  // Definir intervalo de días según acuerdo
  const intervalDays = contract.agreement === "fortnightly" ? 14 : 7;

  // Fecha inicial de pago
  let currentDate = getNextSaturday();

  // Copia de productos con info de cuotas restantes
  const productPlans = contract.products.map((p) => {
    const installmentAmount =
      contract.agreement === "fortnightly"
        ? p.product.installmentAmount * 2
        : p.product.installmentAmount;

    const totalPrice = p.product.price * p.quantity;
    const installmentsCount = Math.ceil(totalPrice / installmentAmount);

    return {
      remainingInstallments: installmentsCount,
      installmentAmount,
    };
  });

  // Mientras haya al menos un producto con cuotas pendientes
  while (productPlans.some((p) => p.remainingInstallments > 0)) {
    // Calcular monto de esta cuota sumando todos los productos activos
    productPlans.forEach((p) => {
      if (p.remainingInstallments > 0) {
        p.remainingInstallments--;
      }
    });

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
      dueDate: currentDate.toISOString(),
      amountPaid: null,
      debt: payments.length === 0 ? contract.totalPrice.toString() : undefined,
    });

    // Avanzar fecha al siguiente pago
    currentDate = currentDate.add(intervalDays, "day");
  }

  console.log(payments);

  return payments;
}
