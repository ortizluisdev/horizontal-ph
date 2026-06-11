import { buildFinancialPrompt } from "../prompts/financial.prompts.js";
import { generateTextResponse } from "../provider/llm.provider.js";

export interface FinancialAgentInput {
  request: string;
  details?: string;
}

export async function runFinancialAgent(input: FinancialAgentInput) {
  const prompt = buildFinancialPrompt(input.request, input.details);

  const response = await generateTextResponse({
    input: prompt,
    systemPrompt: "Eres un analista financiero para bienes raíces y administración de conjuntos residenciales.",
    temperature: 0.2,
    maxTokens: 650,
  });

  return response.text;
}
