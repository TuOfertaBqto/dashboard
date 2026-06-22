import { numeroALetras } from "./numero-a-letras";

export function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    binance: "Binance",
    paypal: "PayPal",
    zelle: "Zelle",
    mobile_payment: "Pago móvil",
    bank_transfer: "Transferencia bancaria",
    cash: "Efectivo",
    discount: "Descuento",
    payment_agreement: "Convenio",
  };

  return translations[method] ?? method;
}

export function translateUserRole(role: string): string {
  const translations: Record<string, string> = {
    main: "Principal",
    super_admin: "Super Administrador",
    admin: "Administrador",
    vendor: "Vendedor",
    customer: "Cliente",
  };

  return translations[role] ?? role;
}

export function formatDateToText(
  dateString: string,
  withYear: boolean,
): string {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  const monthText = date.toLocaleString("es-ES", { month: "long" });

  const capitalizedMonth =
    monthText.charAt(0).toUpperCase() + monthText.slice(1);

  const dayText = numeroALetras(day);
  const yearText = numeroALetras(year);

  if (day === 1) {
    if (withYear) {
      return `al primer (1) día del mes de ${capitalizedMonth} del año ${yearText} (${year})`;
    }
    return `al primer (1) día del mes de ${capitalizedMonth} de ${year}`;
  }

  if (withYear)
    return `a los ${dayText} (${day}) días del mes de ${capitalizedMonth} del año ${yearText} (${year})`;

  return `a los ${dayText.toUpperCase()} (${day}) días del mes de ${capitalizedMonth} de ${year}`;
}
