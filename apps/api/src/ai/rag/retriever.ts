import type { RAGDocument } from "./document.ingester.js";

function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

export function searchRelevantDocuments(documents: RAGDocument[], queryEmbedding: number[], limit = 5) {
  return documents
    .filter((document) => Array.isArray(document.embedding) && document.embedding.length > 0)
    .map((document) => ({
      document,
      score: cosineSimilarity(document.embedding ?? [], queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.document);
}
