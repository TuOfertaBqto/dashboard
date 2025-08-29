export function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    binance: "Binance",
    paypal: "PayPal",
    zelle: "Zelle",
    mobile_payment: "Pago móvil",
    bank_transfer: "Transferencia bancaria",
    cash: "Efectivo",
    discount: "Descuento",
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
