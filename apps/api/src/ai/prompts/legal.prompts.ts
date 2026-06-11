export function buildLegalPrompt(request: string, context?: string) {
  const instructions = [
    "Eres un asistente especializado en normativa y cumplimiento legal para conjuntos residenciales.",
    "Responde en español y enfócate en normas, riesgos y recomendaciones claras.",
    context ? `Contexto: ${context}` : undefined,
    `Consulta: ${request}`,
  ].filter(Boolean);

  return instructions.join("\n\n");
}
