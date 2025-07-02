export const formatCurrency = (value: number) => {
  const realValue = value / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(realValue);
};
