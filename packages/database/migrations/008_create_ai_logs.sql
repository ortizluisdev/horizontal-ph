-- 008_create_ai_logs.sql
-- Tabla de Logs de IA (registro de interacciones con agentes de IA)
-- Registra todas las consultas, respuestas y acciones realizadas por agentes IA

CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conjunto_id UUID REFERENCES conjuntos(id) ON DELETE SET NULL,
  usuario_id UUID,
  session_id TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- financial, collections, legal, reports, documents, generic
  agent_name TEXT,
  request_type TEXT, -- query, command, analysis, report, suggestion
  request_content TEXT NOT NULL,
  request_tokens INTEGER,
  response_content TEXT,
  response_tokens INTEGER,
  total_tokens INTEGER,
  model_used TEXT, -- gpt-4, gpt-3.5-turbo, claude, otro
  temperatura DECIMAL(3, 2),
  top_p DECIMAL(3, 2),
  status TEXT DEFAULT 'completed', -- completed, failed, timeout, error
  error_message TEXT,
  execution_time_ms INTEGER,
  cost_estimated DECIMAL(10, 6),
  action_performed TEXT, -- acción ejecutada por el agente (si aplica)
  action_status TEXT, -- success, pending, failed
  embedding_used BOOLEAN DEFAULT false,
  rag_documents_count INTEGER,
  rag_confidence_score DECIMAL(3, 2),
  feedback_score INTEGER, -- 1-5 calificación del usuario
  feedback_comment TEXT,
  tags JSONB, -- array de tags para categorización
  metadata JSONB, -- datos adicionales en formato JSON
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de RAG (Retrieval Augmented Generation) - Documentos recuperados
CREATE TABLE IF NOT EXISTS ai_rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_log_id UUID NOT NULL REFERENCES ai_logs(id) ON DELETE CASCADE,
  document_id TEXT,
  document_title TEXT,
  document_type TEXT, -- policy, procedure, report, template, etc.
  similarity_score DECIMAL(3, 2),
  content_preview TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Conversaciones multi-turno de IA
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID,
  agent_type TEXT NOT NULL,
  titulo TEXT,
  contexto TEXT,
  estado TEXT DEFAULT 'activa', -- activa, archivada, cerrada
  tokens_usados INTEGER DEFAULT 0,
  costo_total DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de Mensajes dentro de conversaciones
CREATE TABLE IF NOT EXISTS ai_conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  rol TEXT NOT NULL, -- user, assistant, system
  contenido TEXT NOT NULL,
  tokens INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_ai_logs_tenant_id ON ai_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_conjunto_id ON ai_logs (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_usuario_id ON ai_logs (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_agent_type ON ai_logs (agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status ON ai_logs (status);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session_id ON ai_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_is_flagged ON ai_logs (is_flagged);

CREATE INDEX IF NOT EXISTS idx_ai_rag_documents_ai_log ON ai_rag_documents (ai_log_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_tenant ON ai_conversations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_usuario ON ai_conversations (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent ON ai_conversations (agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_estado ON ai_conversations (estado);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON ai_conversations (created_at);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_conversation ON ai_conversation_messages (conversation_id);

-- Comentarios de las tablas
COMMENT ON TABLE ai_logs IS 'Registro completo de todas las interacciones con agentes de IA';
COMMENT ON COLUMN ai_logs.agent_type IS 'Tipo de agente: financial, collections, legal, reports, documents';
COMMENT ON COLUMN ai_logs.status IS 'Estado de la ejecución: completed, failed, timeout, error';
COMMENT ON TABLE ai_rag_documents IS 'Documentos recuperados mediante RAG para una consulta de IA';
COMMENT ON TABLE ai_conversations IS 'Conversaciones multi-turno con agentes de IA';
COMMENT ON TABLE ai_conversation_messages IS 'Historial de mensajes dentro de una conversación';
