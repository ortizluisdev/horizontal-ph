-- 007_create_pqrs.sql
-- Tabla de PQRS (Peticiones, Quejas, Reclamos, Sugerencias)
-- Gestiona la comunicación y gestión de solicitudes de los residentes

CREATE TABLE IF NOT EXISTS pqrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  usuario_id UUID,
  numero_radicado TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL, -- peticion, queja, reclamo, sugerencia
  asunto TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT, -- infraestructura, servicios, seguridad, convivencia, otro
  prioridad TEXT DEFAULT 'normal', -- baja, normal, alta, urgente
  estado TEXT DEFAULT 'abierta', -- abierta, en proceso, resuelta, cerrada, archivada
  fecha_radicacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_respuesta TIMESTAMP WITH TIME ZONE,
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  tiempo_resolucion_dias INTEGER,
  nombre_solicitante TEXT,
  email_solicitante TEXT,
  telefono_solicitante TEXT,
  responsable_asignado_id UUID,
  responsable_asignado_nombre TEXT,
  respuesta_descripcion TEXT,
  respuesta_usuario_id UUID,
  documentos_adjuntos JSONB, -- array de URLs o referencias a archivos
  evidencia_foto_url TEXT,
  ubicacion_afectada TEXT,
  requiere_seguimiento BOOLEAN DEFAULT false,
  fecha_proximo_seguimiento DATE,
  calificacion_satisfaccion INTEGER, -- 1-5
  comentario_satisfaccion TEXT,
  observaciones_internas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Tabla de Seguimiento y Historial de PQRS
CREATE TABLE IF NOT EXISTS pqrs_seguimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pqrs_id UUID NOT NULL REFERENCES pqrs(id) ON DELETE CASCADE,
  accion TEXT NOT NULL,
  descripcion TEXT,
  estado_anterior TEXT,
  estado_nuevo TEXT,
  usuario_id UUID,
  usuario_nombre TEXT,
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_pqrs_conjunto_id ON pqrs (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_unidad_id ON pqrs (unidad_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_tipo ON pqrs (tipo);
CREATE INDEX IF NOT EXISTS idx_pqrs_estado ON pqrs (estado);
CREATE INDEX IF NOT EXISTS idx_pqrs_prioridad ON pqrs (prioridad);
CREATE INDEX IF NOT EXISTS idx_pqrs_categoria ON pqrs (categoria);
CREATE INDEX IF NOT EXISTS idx_pqrs_numero_radicado ON pqrs (numero_radicado);
CREATE INDEX IF NOT EXISTS idx_pqrs_fecha_radicacion ON pqrs (fecha_radicacion);
CREATE INDEX IF NOT EXISTS idx_pqrs_responsable ON pqrs (responsable_asignado_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_usuario_id ON pqrs (usuario_id);

-- Índices para búsquedas de PQRS activas
CREATE INDEX IF NOT EXISTS idx_pqrs_abiertas ON pqrs (conjunto_id, estado) WHERE estado IN ('abierta', 'en proceso');

CREATE INDEX IF NOT EXISTS idx_pqrs_seguimiento_pqrs ON pqrs_seguimiento (pqrs_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_seguimiento_fecha ON pqrs_seguimiento (fecha_cambio);

-- Comentarios de las tablas
COMMENT ON TABLE pqrs IS 'PQRS: Peticiones, Quejas, Reclamos y Sugerencias de residentes';
COMMENT ON COLUMN pqrs.numero_radicado IS 'Número único de radicación del PQRS';
COMMENT ON COLUMN pqrs.tipo IS 'Tipo: peticion, queja, reclamo, sugerencia';
COMMENT ON COLUMN pqrs.estado IS 'Estado: abierta, en proceso, resuelta, cerrada, archivada';
COMMENT ON TABLE pqrs_seguimiento IS 'Histórico de cambios y seguimiento de cada PQRS';
