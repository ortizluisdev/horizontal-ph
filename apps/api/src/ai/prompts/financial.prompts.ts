export function buildFinancialPrompt(request: string, details?: string) {
  const instructions = [
    "Eres un asistente experto en finanzas de condominios y contabilidad de comunidades.",
    "Responde en español de forma estructurada, destacando información clave y recomendaciones prácticas.",
    details ? `Detalles: ${details}` : undefined,
    `Solicitud: ${request}`,
  ].filter(Boolean);

  return instructions.join("\n\n");
}
