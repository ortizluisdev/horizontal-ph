-- 003_create_unidades.sql
-- Tabla de Unidades (apartamentos, casas, locales dentro de un conjunto)
-- Cada unidad pertenece a un conjunto específico

CREATE TABLE IF NOT EXISTS unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  numero_unidad TEXT NOT NULL,
  torre TEXT,
  piso INTEGER,
  tipo TEXT NOT NULL, -- apartamento, casa, local, garaje, bodega, otro
  area_m2 DECIMAL(10, 2),
  area_privada_m2 DECIMAL(10, 2),
  area_comun_m2 DECIMAL(10, 2),
  numero_habitaciones INTEGER,
  numero_banos INTEGER,
  tiene_parqueadero BOOLEAN DEFAULT false,
  numero_parqueaderos INTEGER DEFAULT 0,
  tiene_bodega BOOLEAN DEFAULT false,
  matricula_inmobiliaria TEXT UNIQUE,
  chip_agua TEXT UNIQUE,
  chip_gas TEXT UNIQUE,
  chip_energia TEXT UNIQUE,
  uso TEXT, -- residencial, comercial, otro
  estado TEXT DEFAULT 'activa', -- activa, inactiva, disponible, mantenimiento
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(conjunto_id, numero_unidad, torre)
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_unidades_conjunto_id ON unidades (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_unidades_numero_unidad ON unidades (numero_unidad);
CREATE INDEX IF NOT EXISTS idx_unidades_tipo ON unidades (tipo);
CREATE INDEX IF NOT EXISTS idx_unidades_estado ON unidades (estado);
CREATE INDEX IF NOT EXISTS idx_unidades_piso ON unidades (piso);
CREATE INDEX IF NOT EXISTS idx_unidades_created_at ON unidades (created_at);

-- Comentarios de la tabla
COMMENT ON TABLE unidades IS 'Unidades dentro de conjuntos residenciales (apartamentos, casas, locales, etc.)';
COMMENT ON COLUMN unidades.conjunto_id IS 'Referencia al conjunto al que pertenece la unidad';
COMMENT ON COLUMN unidades.numero_unidad IS 'Número identificador de la unidad (ej: 101, A-301)';
COMMENT ON COLUMN unidades.tipo IS 'Tipo de unidad: apartamento, casa, local, garaje, bodega, otro';
COMMENT ON COLUMN unidades.estado IS 'Estado de la unidad: activa, inactiva, disponible, mantenimiento';
COMMENT ON COLUMN unidades.chip_agua IS 'Número de medidor de agua';
COMMENT ON COLUMN unidades.chip_gas IS 'Número de medidor de gas';
COMMENT ON COLUMN unidades.chip_energia IS 'Número de medidor de energía';
