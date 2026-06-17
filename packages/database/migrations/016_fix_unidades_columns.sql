-- 016_fix_unidades_columns.sql
-- Corrige la tabla unidades para alinearla con el código de la API:
--   · Renombra "tipo" → "tipo_unidad" y lo hace nullable
--   · Agrega la columna "descripcion" (opcional, max 500 chars)
--   · Elimina columnas que no usa la API actual para evitar confusión

BEGIN;

-- 1. Renombrar "tipo" → "tipo_unidad" y hacerlo nullable
ALTER TABLE unidades
  RENAME COLUMN tipo TO tipo_unidad;

ALTER TABLE unidades
  ALTER COLUMN tipo_unidad DROP NOT NULL;

-- 2. Agregar "descripcion" si no existe
ALTER TABLE unidades
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- 3. Actualizar el índice que apuntaba a "tipo"
DROP INDEX IF EXISTS idx_unidades_tipo;
CREATE INDEX IF NOT EXISTS idx_unidades_tipo_unidad ON unidades (tipo_unidad);

COMMENT ON COLUMN unidades.tipo_unidad IS 'Tipo: apartamento, casa, local_comercial, oficina, bodega, parqueadero, otro';
COMMENT ON COLUMN unidades.descripcion  IS 'Descripción libre de la unidad (máx 500 caracteres)';

COMMIT;