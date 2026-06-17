import { buildCollectionsPrompt } from "../prompts/collections.prompts.js";
import { generateTextResponse } from "../provider/llm.provider.js";

export interface CollectionAgentInput {
  subject: string;
  context?: string;
}

export async function runCollectionsAgent(input: CollectionAgentInput) {
  const prompt = buildCollectionsPrompt(input.subject, input.context);

  const response = await generateTextResponse({
    input: prompt,
    systemPrompt: "Actúa como un asesor experto en cobranza y gestión de comunidades.",
    temperature: 0.2,
    maxTokens: 650,
  });

  return response.text;
}