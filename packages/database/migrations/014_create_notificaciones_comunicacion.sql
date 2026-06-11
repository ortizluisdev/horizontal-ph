-- 014_create_notificaciones_comunicacion.sql
-- Tablas para gestionar notificaciones, comunicaciones y boletines
-- Sistema de envío de mensajes a residentes y registro de comunicaciones

CREATE TABLE IF NOT EXISTS canales_comunicacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  tipo TEXT NOT NULL, -- email, sms, push, whatsapp, otro
  proveedor TEXT,
  configuracion JSONB,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS templates_notificacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo_evento TEXT NOT NULL, -- pago vencido, asamblea, mantenimiento, emergencia, otro
  asunto TEXT,
  contenido_template TEXT NOT NULL,
  variables_disponibles JSONB, -- variables que se pueden usar en el template
  canales_defecto JSONB, -- canales por los que se envía
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conjunto_id, nombre)
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates_notificacion(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL, -- pago, mantenimiento, asamblea, seguridad, informativo, otro
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  datos_variables JSONB,
  estado TEXT DEFAULT 'pendiente', -- pendiente, enviada, entregada, leida, fallida
  canal_envio TEXT, -- email, sms, push, whatsapp, otro
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  fecha_lectura TIMESTAMP WITH TIME ZONE,
  razon_fallo TEXT,
  numero_reintentos INTEGER DEFAULT 0,
  max_reintentos INTEGER DEFAULT 3,
  requiere_confirmacion BOOLEAN DEFAULT false,
  confirmada BOOLEAN DEFAULT false,
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  importante BOOLEAN DEFAULT false,
  urgente BOOLEAN DEFAULT false,
  destinatarios JSONB, -- array de emails/numeros
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS boletines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  numero_boletin TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  resumen TEXT,
  fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_emision DATE,
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  revisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  aprobado BOOLEAN DEFAULT false,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  imagen_portada_url TEXT,
  estado TEXT DEFAULT 'borrador', -- borrador, revision, aprobado, publicado, archivado
  distribuido BOOLEAN DEFAULT false,
  fecha_distribucion TIMESTAMP WITH TIME ZONE,
  distribuido_por UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS circulares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  numero_circular TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  asunto TEXT,
  importancia TEXT DEFAULT 'normal', -- baja, normal, alta, critica
  remitente_nombre TEXT,
  remitente_id UUID REFERENCES users(id) ON DELETE SET NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_efectividad DATE,
  documento_adjunto_url TEXT,
  estado TEXT DEFAULT 'vigente', -- vigente, vencida, archivada
  dirigida_a TEXT, -- propietarios, residentes, empleados, todos
  requiere_acuse_recibo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS acuse_recibo_circulares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circular_id UUID NOT NULL REFERENCES circulares(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha_recibido TIMESTAMP WITH TIME ZONE DEFAULT now(),
  nombre_receptor TEXT,
  email_receptor TEXT
);

CREATE TABLE IF NOT EXISTS tablero_anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url TEXT,
  autor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  categoria TEXT, -- general, mantenimiento, eventos, avisos, otro
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  visualizaciones INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historial_lectura_anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anuncio_id UUID NOT NULL REFERENCES tablero_anuncios(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha_lectura TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado TEXT DEFAULT 'activa', -- activa, cerrada, archivada
  tipo TEXT, -- servicio, satisfaccion, general, otro
  resultados_publicados BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS preguntas_encuesta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES encuestas_satisfaccion(id) ON DELETE CASCADE,
  numero_pregunta INTEGER NOT NULL,
  contenido TEXT NOT NULL,
  tipo_respuesta TEXT NOT NULL, -- si_no, escala, multiple, abierta
  opciones_respuesta JSONB, -- para opciones múltiples
  requerida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(encuesta_id, numero_pregunta)
);

CREATE TABLE IF NOT EXISTS respuestas_encuesta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID NOT NULL REFERENCES preguntas_encuesta(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  respuesta TEXT,
  fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_canales_comunicacion_tipo ON canales_comunicacion (tipo);
CREATE INDEX IF NOT EXISTS idx_canales_comunicacion_activo ON canales_comunicacion (activo);

CREATE INDEX IF NOT EXISTS idx_templates_notificacion_conjunto ON templates_notificacion (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_templates_notificacion_tipo ON templates_notificacion (tipo_evento);
CREATE INDEX IF NOT EXISTS idx_templates_notificacion_activo ON templates_notificacion (activo);

CREATE INDEX IF NOT EXISTS idx_notificaciones_conjunto ON notificaciones (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones (usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON notificaciones (estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones (tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha_envio ON notificaciones (fecha_envio);
CREATE INDEX IF NOT EXISTS idx_notificaciones_importante ON notificaciones (importante);
CREATE INDEX IF NOT EXISTS idx_notificaciones_pendientes ON notificaciones (estado, fecha_programada) WHERE estado IN ('pendiente', 'fallida');

CREATE INDEX IF NOT EXISTS idx_boletines_conjunto ON boletines (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_boletines_estado ON boletines (estado);
CREATE INDEX IF NOT EXISTS idx_boletines_fecha_publicacion ON boletines (fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_boletines_numero ON boletines (numero_boletin);

CREATE INDEX IF NOT EXISTS idx_circulares_conjunto ON circulares (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_circulares_estado ON circulares (estado);
CREATE INDEX IF NOT EXISTS idx_circulares_numero ON circulares (numero_circular);
CREATE INDEX IF NOT EXISTS idx_circulares_fecha_emision ON circulares (fecha_emision);

CREATE INDEX IF NOT EXISTS idx_acuse_recibo_circular ON acuse_recibo_circulares (circular_id);
CREATE INDEX IF NOT EXISTS idx_acuse_recibo_usuario ON acuse_recibo_circulares (usuario_id);

CREATE INDEX IF NOT EXISTS idx_tablero_anuncios_conjunto ON tablero_anuncios (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_tablero_anuncios_activo ON tablero_anuncios (activo);
CREATE INDEX IF NOT EXISTS idx_tablero_anuncios_categoria ON tablero_anuncios (categoria);
CREATE INDEX IF NOT EXISTS idx_tablero_anuncios_destacado ON tablero_anuncios (destacado);

CREATE INDEX IF NOT EXISTS idx_historial_lectura_anuncio ON historial_lectura_anuncios (anuncio_id);
CREATE INDEX IF NOT EXISTS idx_historial_lectura_usuario ON historial_lectura_anuncios (usuario_id);

CREATE INDEX IF NOT EXISTS idx_encuestas_conjunto ON encuestas_satisfaccion (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_estado ON encuestas_satisfaccion (estado);

CREATE INDEX IF NOT EXISTS idx_preguntas_encuesta_encuesta ON preguntas_encuesta (encuesta_id);

CREATE INDEX IF NOT EXISTS idx_respuestas_encuesta_pregunta ON respuestas_encuesta (pregunta_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_encuesta_usuario ON respuestas_encuesta (usuario_id);

-- Comentarios de las tablas
COMMENT ON TABLE canales_comunicacion IS 'Canales disponibles para envío de notificaciones (email, SMS, etc.)';
COMMENT ON TABLE templates_notificacion IS 'Templates reutilizables para diferentes tipos de notificaciones';
COMMENT ON TABLE notificaciones IS 'Registro de todas las notificaciones enviadas a usuarios';
COMMENT ON TABLE boletines IS 'Boletines informativos periódicos para residentes';
COMMENT ON TABLE circulares IS 'Circulares y comunicados oficiales del conjunto';
COMMENT ON TABLE tablero_anuncios IS 'Anuncios en tablero público del sistema';
COMMENT ON TABLE encuestas_satisfaccion IS 'Encuestas para medir satisfacción de residentes';
