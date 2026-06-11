import type { EmbeddingModelV1, LanguageModelV1 } from "@ai-sdk/provider";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { env, ensureAiKeyForProvider } from "../../config/env.js";

const OPENAI_CHAT_MODEL = "gpt-4o-mini";
const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const ANTHROPIC_CHAT_MODEL = "claude-3-opus-20240229";

function createOpenAIProvider() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to initialize OpenAI provider");
  }

  return createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    compatibility: "strict",
  });
}

function createAnthropicProvider() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required to initialize Anthropic provider");
  }

  return createAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
}

export function getChatModel(settings?: {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}): LanguageModelV1 {
  const providerName = ensureAiKeyForProvider(env.AI_PROVIDER);

  if (providerName === "anthropic") {
    return createAnthropicProvider().chat(ANTHROPIC_CHAT_MODEL, {
      temperature: settings?.temperature ?? 0.2,
      topK: 8,
      cacheControl: false,
    });
  }

  return createOpenAIProvider().chat(OPENAI_CHAT_MODEL, {
    temperature: settings?.temperature ?? 0.2,
    topP: settings?.topP,
    maxTokens: settings?.maxTokens,
    user: "horizontal-ph",
  });
}

export function getEmbeddingModel(): EmbeddingModelV1<string> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to generate embeddings");
  }

  return createOpenAIProvider().textEmbeddingModel(OPENAI_EMBEDDING_MODEL, {
    maxEmbeddingsPerCall: 16,
  });
}

export type AITextGenerationResult = {
  text: string;
  finishReason: string;
  warnings?: Array<unknown>;
  rawResponse?: unknown;
};

export async function generateTextResponse(options: {
  input: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}): Promise<AITextGenerationResult> {
  const model = getChatModel({
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    topP: options.topP,
    stopSequences: options.stopSequences,
  });

  const prompt: Parameters<LanguageModelV1["doGenerate"]>[0]["prompt"] = [];

  if (options.systemPrompt) {
    prompt.push({ role: "system", content: options.systemPrompt });
  }

  prompt.push({ role: "user", content: [{ type: "text", text: options.input }] });

  const result = await model.doGenerate({
    prompt,
    inputFormat: "messages",
    mode: {
      type: "regular",
    },
    temperature: options.temperature,
    topP: options.topP,
    maxTokens: options.maxTokens,
    stopSequences: options.stopSequences,
  });

  return {
    text: result.text ?? "",
    finishReason: result.finishReason,
    warnings: result.warnings,
    rawResponse: result.rawResponse,
  };
}

export async function embedTextBatch(values: string[]) {
  const model = getEmbeddingModel();
  const embeddingResult = await model.doEmbed({ values });
  return embeddingResult.embeddings;
}
