export interface RAGDocument {
  id: string;
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

export function createRagDocuments(items: Array<{ id: string; title?: string; content: string; metadata?: Record<string, unknown> }>) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content.trim(),
    metadata: item.metadata ?? {},
  }));
}
