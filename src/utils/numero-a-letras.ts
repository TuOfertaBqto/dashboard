// numeroALetras.ts
export function numeroALetras(num: number): string {
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
    "veinte",
  ];

  const decenas = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];

  const centenas = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  if (num === 0) return "cero";
  if (num === 100) return "cien";

  const partes: string[] = [];

  if (num >= 1000) {
    const miles = Math.floor(num / 1000);
    if (miles === 1) {
      partes.push("mil");
    } else {
      partes.push(numeroALetras(miles) + " mil");
    }
    num = num % 1000;
  }

  if (num >= 100) {
    const cent = Math.floor(num / 100);
    partes.push(centenas[cent]);
    num = num % 100;
  }

  if (num > 20) {
    const dec = Math.floor(num / 10);
    const uni = num % 10;
    if (uni > 0) {
      partes.push(decenas[dec] + " y " + unidades[uni]);
    } else {
      partes.push(decenas[dec]);
    }
  } else if (num > 0) {
    partes.push(unidades[num]);
  }

  return partes.join(" ");
}
