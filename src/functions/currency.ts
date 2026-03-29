export function formatCurrency(value: number | string): string {
  // Converter para número se for string
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Validar se é um número válido
  if (isNaN(numericValue)) {
    return "R$ 0.00";
  }

  // Formatar como moeda BRL
  return `R$ ${numericValue.toFixed(2).replace(".", ",")}`;
}
