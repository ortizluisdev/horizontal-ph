-- ─────────────────────────────────────────────────────────────────────────────
-- 015 · Normativa
-- Reglamentos, manuales de convivencia y documentos normativos del conjunto
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS normativa (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id  UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  tipo         TEXT NOT NULL
                 CHECK (tipo IN ('reglamento', 'manual_convivencia', 'acuerdo', 'resolucion', 'circular', 'otro')),
  descripcion  TEXT,
  contenido    TEXT,
  version      TEXT,
  estado       TEXT NOT NULL DEFAULT 'vigente'
                 CHECK (estado IN ('borrador', 'vigente', 'derogada', 'archivada')),
  fecha_vigencia DATE,
  documento_url TEXT,
  activo       BOOLEAN NOT NULL DEFAULT true,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_normativa_conjunto  ON normativa (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_normativa_tipo       ON normativa (tipo);
CREATE INDEX IF NOT EXISTS idx_normativa_estado     ON normativa (estado);
CREATE INDEX IF NOT EXISTS idx_normativa_activo     ON normativa (activo);

COMMENT ON TABLE normativa IS 'Reglamentos y documentos normativos de cada conjunto';