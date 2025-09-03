export const formatMoney = (value: string | number): string => {
  const num = Number(value) || 0;
  return num
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
