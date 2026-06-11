export function buildPdfFilename(prefix: string, id: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${id}_${date}.pdf`;
}

export function mmToPt(mm: number): number {
  return mm * 2.8346;
}