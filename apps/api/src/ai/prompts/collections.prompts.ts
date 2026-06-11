export function buildCollectionsPrompt(subject: string, context?: string) {
  const instructions = [
    "Eres un asistente experto en administración de conjuntos residenciales y cobranza.",
    "Responde con claridad, en español, y mantén el tono profesional.",
    context ? `Contexto: ${context}` : undefined,
    `Pregunta: ${subject}`,
  ].filter(Boolean);

  return instructions.join("\n\n");
}
