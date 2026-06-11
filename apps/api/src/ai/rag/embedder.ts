import type { EmbeddingModelV1 } from "@ai-sdk/provider";
import { getEmbeddingModel } from "../provider/llm.provider.js";
import type { RAGDocument } from "./document.ingester.js";

export interface RAGEmbeddingResult {
  id: string;
  embedding: number[];
}

export async function embedDocuments(documents: RAGDocument[]): Promise<RAGEmbeddingResult[]> {
  const model: EmbeddingModelV1<string> = getEmbeddingModel();
  const values = documents.map((document) => document.content);
  const response = await model.doEmbed({ values });

  return documents.map((document, index) => ({
    id: document.id,
    embedding: response.embeddings[index] ?? [],
  }));
}
