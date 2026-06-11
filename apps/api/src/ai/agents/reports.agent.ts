import { generateTextResponse } from "../provider/llm.provider.js";

export interface ReportAgentInput {
  title: string;
  summary: string;
  audience?: string;
  objective?: string;
}

export async function runReportAgent(input: ReportAgentInput) {
  const instructions = [
    "Eres un generador de informes ejecutivos para la administración de comunidades.",
    `Título: ${input.title}`,
    `Resumen: ${input.summary}`,
    input.audience ? `Audiencia: ${input.audience}` : undefined,
    input.objective ? `Objetivo: ${input.objective}` : undefined,
    "Crea un informe claro, con secciones de contexto, hallazgos y recomendaciones.",
  ].filter(Boolean);

  const response = await generateTextResponse({
    input: instructions.join("\n\n"),
    systemPrompt: "Escribe un informe profesional y fácil de leer.",
    temperature: 0.25,
    maxTokens: 750,
  });

  return response.text;
}
