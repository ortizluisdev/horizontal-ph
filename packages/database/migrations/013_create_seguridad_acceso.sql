-- 013_create_seguridad_acceso.sql
-- Tablas para gestionar seguridad física y control de acceso
-- Cubre control de ingreso, eventos de seguridad y vigilancia

CREATE TABLE IF NOT EXISTS control_acceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nombre_visitante TEXT,
  tipo_acceso TEXT NOT NULL, -- residente, visitante, empleado, proveedor, otro
  documento_identificacion TEXT,
  placa_vehiculo TEXT,
  hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT now(),
  hora_salida TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  proposito_visita TEXT,
  quien_autoriza_nombre TEXT,
  quien_autoriza_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vigilante_entrada_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vigilante_salida_id UUID REFERENCES users(id) ON DELETE SET NULL,
  numero_acompanantes INTEGER DEFAULT 0,
  vehiculos_acompanantes INTEGER DEFAULT 0,
  registrado BOOLEAN DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Pases de Ingreso (tarjetas/stickers)
CREATE TABLE IF NOT EXISTS pases_ingreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES users(id) ON DELETE SET NULL,
  codigo_pase TEXT UNIQUE NOT NULL,
  tipo_pase TEXT NOT NULL, -- residente, visitante, proveedor, empleado, temporal
  numero_serie TEXT,
  descripcion TEXT,
  valor_deposito DECIMAL(10, 2),
  valor_reposicion DECIMAL(10, 2),
  fecha_emision DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'activo', -- activo, inactivo, perdido, reposicion, cancelado
  reportado_perdido BOOLEAN DEFAULT false,
  fecha_perdida DATE,
  numero_reposiciones INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Eventos de Seguridad
CREATE TABLE IF NOT EXISTS eventos_seguridad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  tipo_evento TEXT NOT NULL, -- acceso no autorizado, intento robo, vandalismo, disturbio, accidente, otro
  severity TEXT DEFAULT 'normal', -- leve, normal, grave, critica
  descripcion TEXT NOT NULL,
  fecha_evento TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reportado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  detalles_evento TEXT,
  personas_involucradas TEXT,
  bienes_afectados TEXT,
  autoridades_notificadas BOOLEAN DEFAULT false,
  numero_denuncia TEXT,
  fotos_url JSONB,
  videos_url JSONB,
  estado TEXT DEFAULT 'reportado', -- reportado, investigando, resuelto, archivado
  resolucion TEXT,
  fecha_resolucion DATE,
  costo_reparacion DECIMAL(12, 2),
  acciones_tomadas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Bitacora de Vigilancia
CREATE TABLE IF NOT EXISTS bitacora_vigilancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  vigilante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  turno TEXT NOT NULL, -- noche, mañana, tarde
  fecha_turno DATE NOT NULL,
  hora_inicio TIMESTAMP WITH TIME ZONE,
  hora_fin TIMESTAMP WITH TIME ZONE,
  anotaciones TEXT,
  novedad_reporte TEXT,
  cantidad_accesos INTEGER DEFAULT 0,
  cantidad_visitantes INTEGER DEFAULT 0,
  cantidad_eventos_anormales INTEGER DEFAULT 0,
  observaciones TEXT,
  supervisor_revision_id UUID REFERENCES users(id) ON DELETE SET NULL,
  fecha_revision DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Cámaras de Vigilancia
CREATE TABLE IF NOT EXISTS camaras_vigilancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  codigo_camara TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  tipo TEXT NOT NULL, -- domo, cilindrica, tipo bala, otro
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  resolucion TEXT, -- 1080p, 2k, 4k, otro
  angulo_vision TEXT,
  zona_cobertura TEXT,
  conectividad TEXT, -- LAN, PoE, WiFi, 4G, otro
  nvr_id TEXT,
  canal_grabacion INTEGER,
  dias_retencion_video INTEGER DEFAULT 30,
  fecha_instalacion DATE,
  fecha_ultimo_mantenimiento DATE,
  proxima_revision DATE,
  activa BOOLEAN DEFAULT true,
  en_funcionamiento BOOLEAN DEFAULT true,
  observaciones TEXT,
  proveedor_mantenimiento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Llamadas de Emergencia/Botones de Pánico
CREATE TABLE IF NOT EXISTS botones_panico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  numero_boton TEXT UNIQUE NOT NULL,
  ubicacion TEXT NOT NULL,
  tipo TEXT NOT NULL, -- residente, area comun, entrada
  estado TEXT DEFAULT 'activo', -- activo, inactivo, defectuoso
  numero_telefono_emergencia TEXT,
  fecha_instalacion DATE,
  ultima_prueba DATE,
  proxima_prueba DATE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Activaciones de Botón de Pánico
CREATE TABLE IF NOT EXISTS activaciones_panico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boton_panico_id UUID NOT NULL REFERENCES botones_panico(id) ON DELETE CASCADE,
  fecha_activacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID REFERENCES users(id) ON DELETE SET NULL,
  razon_activacion TEXT,
  fue_falsa_alarma BOOLEAN DEFAULT false,
  respuesta_recibida BOOLEAN DEFAULT false,
  tiempo_respuesta_minutos INTEGER,
  descripcion_incidente TEXT,
  ambulancia_requerida BOOLEAN DEFAULT false,
  policia_requerida BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_control_acceso_conjunto ON control_acceso (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_control_acceso_unidad ON control_acceso (unidad_id);
CREATE INDEX IF NOT EXISTS idx_control_acceso_usuario ON control_acceso (usuario_id);
CREATE INDEX IF NOT EXISTS idx_control_acceso_tipo ON control_acceso (tipo_acceso);
CREATE INDEX IF NOT EXISTS idx_control_acceso_fecha ON control_acceso (hora_entrada);
CREATE INDEX IF NOT EXISTS idx_control_acceso_sin_salida ON control_acceso (conjunto_id, hora_salida) WHERE hora_salida IS NULL;

CREATE INDEX IF NOT EXISTS idx_pases_ingreso_conjunto ON pases_ingreso (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_pases_ingreso_usuario ON pases_ingreso (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pases_ingreso_codigo ON pases_ingreso (codigo_pase);
CREATE INDEX IF NOT EXISTS idx_pases_ingreso_estado ON pases_ingreso (estado);

CREATE INDEX IF NOT EXISTS idx_eventos_seguridad_conjunto ON eventos_seguridad (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_eventos_seguridad_tipo ON eventos_seguridad (tipo_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_seguridad_severity ON eventos_seguridad (severity);
CREATE INDEX IF NOT EXISTS idx_eventos_seguridad_fecha ON eventos_seguridad (fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_seguridad_estado ON eventos_seguridad (estado);

CREATE INDEX IF NOT EXISTS idx_bitacora_vigilancia_conjunto ON bitacora_vigilancia (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_vigilancia_vigilante ON bitacora_vigilancia (vigilante_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_vigilancia_fecha ON bitacora_vigilancia (fecha_turno);

CREATE INDEX IF NOT EXISTS idx_camaras_vigilancia_conjunto ON camaras_vigilancia (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_camaras_vigilancia_codigo ON camaras_vigilancia (codigo_camara);
CREATE INDEX IF NOT EXISTS idx_camaras_vigilancia_activa ON camaras_vigilancia (activa);

CREATE INDEX IF NOT EXISTS idx_botones_panico_conjunto ON botones_panico (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_botones_panico_estado ON botones_panico (estado);

CREATE INDEX IF NOT EXISTS idx_activaciones_panico_boton ON activaciones_panico (boton_panico_id);
CREATE INDEX IF NOT EXISTS idx_activaciones_panico_fecha ON activaciones_panico (fecha_activacion);

-- Comentarios de las tablas
COMMENT ON TABLE control_acceso IS 'Registro de entrada y salida de residentes, visitantes y proveedores';
COMMENT ON TABLE pases_ingreso IS 'Pases de ingreso (tarjetas, stickers) y control de reposiciones';
COMMENT ON TABLE eventos_seguridad IS 'Eventos y incidentes de seguridad reportados en el conjunto';
COMMENT ON TABLE bitacora_vigilancia IS 'Registro diario de actividades por vigilante en cada turno';
COMMENT ON TABLE camaras_vigilancia IS 'Cámaras de vigilancia instaladas en el conjunto';
COMMENT ON TABLE botones_panico IS 'Botones de pánico para situaciones de emergencia';
COMMENT ON TABLE activaciones_panico IS 'Registro de activaciones de botones de pánico';
