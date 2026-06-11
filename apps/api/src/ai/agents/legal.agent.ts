import { buildLegalPrompt } from "../prompts/legal.prompts.js";
import { generateTextResponse } from "../provider/llm.provider.js";

export interface LegalAgentInput {
  request: string;
  context?: string;
}

export async function runLegalAgent(input: LegalAgentInput) {
  const prompt = buildLegalPrompt(input.request, input.context);

  const response = await generateTextResponse({
    input: prompt,
    systemPrompt: "Eres un asesor legal especializado en normativa residencial y comunitaria.",
    temperature: 0.1,
    maxTokens: 700,
  });

  return response.text;
}
