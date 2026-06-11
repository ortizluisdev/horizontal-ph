export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function parseCOP(value: string): number {
  return Number(value.replace(/[^0-9,-]/g, "").replace(",", "."));
}