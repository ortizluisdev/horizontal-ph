-- =============================================================================
-- Normativa v2 — ampliar esquema
-- Ejecutar manualmente: psql -d <db> -f migration_v2.sql
-- =============================================================================

BEGIN;

-- Eliminar constraints viejos si existen
ALTER TABLE normativa
  DROP CONSTRAINT IF EXISTS normativa_tipo_check,
  DROP CONSTRAINT IF EXISTS normativa_estado_check;

-- Migrar valores de tipo al nuevo sistema
UPDATE normativa SET tipo = 'reglamento_ph' WHERE tipo = 'reglamento';
UPDATE normativa SET tipo = 'acta_asamblea' WHERE tipo = 'acuerdo';

-- Migrar valores de estado al nuevo sistema
UPDATE normativa SET estado = 'derogado'  WHERE estado = 'derogada';
UPDATE normativa SET estado = 'archivado' WHERE estado = 'archivada';

-- Agregar nuevas columnas
ALTER TABLE normativa
  ADD COLUMN IF NOT EXISTS categoria_legal       VARCHAR(60),
  ADD COLUMN IF NOT EXISTS alcance               VARCHAR(60)  NOT NULL DEFAULT 'todos_propietarios',
  ADD COLUMN IF NOT EXISTS numero_documento      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS archivo_url           TEXT,
  ADD COLUMN IF NOT EXISTS archivo_nombre        VARCHAR(300),
  ADD COLUMN IF NOT EXISTS archivo_tamano        INTEGER,
  ADD COLUMN IF NOT EXISTS fecha_emision         DATE,
  ADD COLUMN IF NOT EXISTS fecha_vigencia_desde  DATE,
  ADD COLUMN IF NOT EXISTS fecha_vigencia_hasta  DATE,
  ADD COLUMN IF NOT EXISTS asamblea_id           UUID REFERENCES asambleas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS aprobado_por          VARCHAR(300),
  ADD COLUMN IF NOT EXISTS tags                  TEXT[] NOT NULL DEFAULT '{}';

-- Migrar datos de columnas viejas
UPDATE normativa SET archivo_url = documento_url
  WHERE documento_url IS NOT NULL AND archivo_url IS NULL;
UPDATE normativa SET fecha_vigencia_desde = fecha_vigencia
  WHERE fecha_vigencia IS NOT NULL AND fecha_vigencia_desde IS NULL;

-- Agregar nuevas constraints
ALTER TABLE normativa
  ADD CONSTRAINT normativa_tipo_check CHECK (
    tipo IN (
      'reglamento_ph','manual_convivencia','acta_asamblea','resolucion',
      'circular','politica_interna','contrato','ley_decreto','otro'
    )
  ),
  ADD CONSTRAINT normativa_estado_check CHECK (
    estado IN ('borrador','en_revision','vigente','derogado','archivado')
  );

COMMIT;
