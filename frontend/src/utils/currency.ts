export const formatCurrency = (
  value: number,
  currency: string
): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};