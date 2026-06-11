export interface AiLogEntry {
  id: string;
  usuario_id?: string | null;
  conjunto_id?: string | null;
  modulo: string;
  prompt: string;
  respuesta?: string | null;
  tokens_usados?: number | null;
  created_at?: string;
}

export interface AiAgentInput {
  prompt: string;
  usuarioId?: string | null;
  conjuntoId?: string | null;
}