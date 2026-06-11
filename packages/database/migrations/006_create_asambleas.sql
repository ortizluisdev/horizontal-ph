-- 006_create_asambleas.sql
-- Tabla de Asambleas (reuniones de propietarios, juntas directivas, votaciones)
-- Gestiona asambleas, actas y participación de propietarios

CREATE TABLE IF NOT EXISTS asambleas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  numero_acta TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL, -- ordinaria, extraordinaria, junta directiva, otro
  asunto TEXT NOT NULL,
  descripcion TEXT,
  fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_realizada TIMESTAMP WITH TIME ZONE,
  lugar TEXT,
  presidente_nombre TEXT,
  secretario_nombre TEXT,
  quorum_requerido INTEGER,
  asistentes_presente INTEGER,
  asistentes_ausentes INTEGER,
  representantes INTEGER,
  votacion_requerida BOOLEAN DEFAULT false,
  estado TEXT DEFAULT 'programada', -- programada, realizada, cancelada
  documento_acta_url TEXT,
  adjunto_url TEXT,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Tabla de Acuerdos generados en asambleas
CREATE TABLE IF NOT EXISTS asamblea_acuerdos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  numero_acuerdo INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  responsable_nombre TEXT,
  responsable_id UUID,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'pendiente', -- pendiente, en progreso, cumplido, no cumplido
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(asamblea_id, numero_acuerdo)
);

-- Tabla de Votaciones en asambleas
CREATE TABLE IF NOT EXISTS asamblea_votaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  numero_votacion INTEGER NOT NULL,
  tema TEXT NOT NULL,
  descripcion TEXT,
  votos_a_favor INTEGER DEFAULT 0,
  votos_en_contra INTEGER DEFAULT 0,
  abstenciones INTEGER DEFAULT 0,
  resultado TEXT, -- aprobado, rechazado, aplazado
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(asamblea_id, numero_votacion)
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_asambleas_conjunto_id ON asambleas (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_asambleas_tipo ON asambleas (tipo);
CREATE INDEX IF NOT EXISTS idx_asambleas_estado ON asambleas (estado);
CREATE INDEX IF NOT EXISTS idx_asambleas_fecha_programada ON asambleas (fecha_programada);
CREATE INDEX IF NOT EXISTS idx_asambleas_numero_acta ON asambleas (numero_acta);
CREATE INDEX IF NOT EXISTS idx_asambleas_created_at ON asambleas (created_at);

CREATE INDEX IF NOT EXISTS idx_asamblea_acuerdos_asamblea ON asamblea_acuerdos (asamblea_id);
CREATE INDEX IF NOT EXISTS idx_asamblea_acuerdos_estado ON asamblea_acuerdos (estado);
CREATE INDEX IF NOT EXISTS idx_asamblea_acuerdos_vencimiento ON asamblea_acuerdos (fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_asamblea_votaciones_asamblea ON asamblea_votaciones (asamblea_id);

-- Comentarios de las tablas
COMMENT ON TABLE asambleas IS 'Asambleas, juntas directivas y reuniones de propietarios';
COMMENT ON TABLE asamblea_acuerdos IS 'Acuerdos y compromisos generados en las asambleas';
COMMENT ON TABLE asamblea_votaciones IS 'Registro de votaciones realizadas en las asambleas';
