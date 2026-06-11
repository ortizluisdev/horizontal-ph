-- 012_create_servicios_infraestructura.sql
-- Tablas para gestionar servicios e infraestructura del conjunto
-- Cubre áreas comunes, servicios contratados, y mantenimiento

CREATE TABLE IF NOT EXISTS servicios_contratados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- agua, gas, energia, basuras, seguridad, mantenimiento, otro
  proveedor_nombre TEXT NOT NULL,
  proveedor_contacto TEXT,
  proveedor_email TEXT,
  proveedor_telefono TEXT,
  cuenta_numero TEXT,
  valor_mensual DECIMAL(12, 2),
  frecuencia TEXT DEFAULT 'mensual', -- diaria, semanal, mensual, trimestral, anual
  contrato_url TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Áreas Comunes
CREATE TABLE IF NOT EXISTS areas_comunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  ubicacion TEXT,
  tipo TEXT, -- piscina, gimnasio, parque, lobby, salon eventos, cancha, otro
  area_m2 DECIMAL(10, 2),
  capacidad_personas INTEGER,
  horario_acceso TEXT,
  requiere_reserva BOOLEAN DEFAULT false,
  valor_mantenimiento_mensual DECIMAL(10, 2),
  activo BOOLEAN DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conjunto_id, nombre)
);

-- Tabla de Reservas de Áreas Comunes
CREATE TABLE IF NOT EXISTS reservas_areas_comunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_comun_id UUID NOT NULL REFERENCES areas_comunes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  numero_personas INTEGER,
  proposito TEXT,
  estado TEXT DEFAULT 'confirmada', -- confirmada, cancelada, completada
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cancelada_por UUID REFERENCES users(id) ON DELETE SET NULL,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE
);

-- Tabla de Mantenimiento y Reparaciones
CREATE TABLE IF NOT EXISTS mantenimiento_reparaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  area_comun_id UUID REFERENCES areas_comunes(id) ON DELETE SET NULL,
  numero_orden TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL, -- preventivo, correctivo, emergencia
  categoria TEXT NOT NULL, -- fontaneria, electricidad, pintura, estructural, otro
  descripcion TEXT NOT NULL,
  prioridad TEXT DEFAULT 'normal', -- baja, normal, alta, emergencia
  estado TEXT DEFAULT 'pendiente', -- pendiente, en proceso, completado, cancelado
  contratista_nombre TEXT,
  contratista_email TEXT,
  contratista_telefono TEXT,
  valor_presupuesto DECIMAL(12, 2),
  valor_final DECIMAL(12, 2),
  fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_programada DATE,
  fecha_inicio DATE,
  fecha_finalizacion DATE,
  dias_completacion INTEGER,
  materiales_url TEXT,
  fotos_antes_url JSONB,
  fotos_despues_url JSONB,
  observaciones TEXT,
  aprobado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  fecha_aprobacion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Tabla de Inspecciones Técnicas
CREATE TABLE IF NOT EXISTS inspecciones_tecnicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  numero_inspeccion TEXT UNIQUE NOT NULL,
  tipo_inspeccion TEXT NOT NULL, -- estructural, electrica, hidraulica, seguridad, general
  fecha_inspeccion DATE NOT NULL,
  inspector_nombre TEXT,
  inspector_empresa TEXT,
  firma_inspector TEXT,
  hallazgos TEXT,
  recomendaciones TEXT,
  prioridad_reparaciones TEXT, -- baja, media, alta, critica
  documento_reporte_url TEXT,
  estado TEXT DEFAULT 'registrada', -- registrada, procesada, completada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Documentación de Infraestructura
CREATE TABLE IF NOT EXISTS infraestructura_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo_documento TEXT NOT NULL, -- plano, licencia, certificado, manual, otro
  descripcion TEXT,
  url_documento TEXT,
  fecha_documento DATE,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'vigente', -- vigente, vencido, archivado
  almacenado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_servicios_contratados_conjunto ON servicios_contratados (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_servicios_contratados_tipo ON servicios_contratados (tipo);
CREATE INDEX IF NOT EXISTS idx_servicios_contratados_activo ON servicios_contratados (activo);

CREATE INDEX IF NOT EXISTS idx_areas_comunes_conjunto ON areas_comunes (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_areas_comunes_tipo ON areas_comunes (tipo);
CREATE INDEX IF NOT EXISTS idx_areas_comunes_activo ON areas_comunes (activo);

CREATE INDEX IF NOT EXISTS idx_reservas_areas_area ON reservas_areas_comunes (area_comun_id);
CREATE INDEX IF NOT EXISTS idx_reservas_areas_usuario ON reservas_areas_comunes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_areas_fecha ON reservas_areas_comunes (fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_reservas_areas_estado ON reservas_areas_comunes (estado);

CREATE INDEX IF NOT EXISTS idx_mantenimiento_conjunto ON mantenimiento_reparaciones (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_unidad ON mantenimiento_reparaciones (unidad_id);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_estado ON mantenimiento_reparaciones (estado);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_tipo ON mantenimiento_reparaciones (tipo);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_prioridad ON mantenimiento_reparaciones (prioridad);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_numero_orden ON mantenimiento_reparaciones (numero_orden);

CREATE INDEX IF NOT EXISTS idx_inspecciones_conjunto ON inspecciones_tecnicas (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_inspecciones_tipo ON inspecciones_tecnicas (tipo_inspeccion);
CREATE INDEX IF NOT EXISTS idx_inspecciones_fecha ON inspecciones_tecnicas (fecha_inspeccion);

CREATE INDEX IF NOT EXISTS idx_infraestructura_docs_conjunto ON infraestructura_documentos (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_infraestructura_docs_tipo ON infraestructura_documentos (tipo_documento);
CREATE INDEX IF NOT EXISTS idx_infraestructura_docs_estado ON infraestructura_documentos (estado);

-- Comentarios de las tablas
COMMENT ON TABLE servicios_contratados IS 'Servicios públicos y privados contratados por el conjunto';
COMMENT ON TABLE areas_comunes IS 'Áreas comunes y espacios compartidos del conjunto';
COMMENT ON TABLE reservas_areas_comunes IS 'Reservas y asignaciones de áreas comunes por residentes';
COMMENT ON TABLE mantenimiento_reparaciones IS 'Solicitudes y seguimiento de mantenimiento y reparaciones';
COMMENT ON TABLE inspecciones_tecnicas IS 'Inspecciones profesionales de infraestructura';
COMMENT ON TABLE infraestructura_documentos IS 'Documentación técnica de la infraestructura del conjunto';
