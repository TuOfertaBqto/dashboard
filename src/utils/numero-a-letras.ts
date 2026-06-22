export function numeroALetras(n: number): string {
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
  ];

  const especiales = [
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

  if (n === 0) return "cero";
  if (n === 100) return "cien";

  const convertirMenorMil = (num: number): string => {
    let resultado = "";

    const c = Math.floor(num / 100);
    const resto = num % 100;

    if (c > 0) resultado += centenas[c] + " ";

    if (resto < 10) {
      resultado += unidades[resto];
    } else if (resto < 20) {
      resultado += especiales[resto - 10];
    } else if (resto < 30) {
      resultado += resto === 20 ? "veinte" : `veinti${unidades[resto - 20]}`;
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;

      resultado += decenas[d];

      if (u > 0) {
        resultado += ` y ${unidades[u]}`;
      }
    }

    return resultado.trim();
  };

  if (n < 1000) return convertirMenorMil(n);

  const miles = Math.floor(n / 1000);
  const resto = n % 1000;

  let resultado = miles === 1 ? "mil" : `${convertirMenorMil(miles)} mil`;

  if (resto > 0) {
    resultado += ` ${convertirMenorMil(resto)}`;
  }

  return resultado.trim();
}
