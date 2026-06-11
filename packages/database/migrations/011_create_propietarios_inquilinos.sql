-- 011_create_propietarios_inquilinos.sql
-- Tabla de Propietarios e Inquilinos
-- Gestiona la relación entre propietarios, inquilinos y unidades

CREATE TABLE IF NOT EXISTS propietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  numero_documento TEXT NOT NULL,
  tipo_documento TEXT DEFAULT 'CC', -- CC, CE, NIT, PEP, PAS
  fecha_nacimiento DATE,
  direccion_permanente TEXT,
  ciudad_procedencia TEXT,
  telefono_adicional TEXT,
  fecha_compra DATE,
  porcentaje_propiedad DECIMAL(5, 2),
  activo BOOLEAN DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conjunto_id, numero_documento)
);

-- Tabla de relación entre propietarios y unidades
CREATE TABLE IF NOT EXISTS propietario_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propietario_id UUID NOT NULL REFERENCES propietarios(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  tipo_tenencia TEXT DEFAULT 'propia', -- propia, arrendada, usufructo
  porcentaje_participacion DECIMAL(5, 2),
  derechos_y_obligaciones TEXT,
  fecha_desde DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_hasta DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(propietario_id, unidad_id, fecha_desde)
);

CREATE TABLE IF NOT EXISTS inquilinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  propietario_id UUID REFERENCES propietarios(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  numero_documento TEXT NOT NULL,
  tipo_documento TEXT DEFAULT 'CC', -- CC, CE, NIT, PEP, PAS
  fecha_nacimiento DATE,
  direccion_anterior TEXT,
  ciudad_anterior TEXT,
  ocupacion TEXT,
  empresa TEXT,
  numero_personas_hogar INTEGER,
  tiene_mascotas BOOLEAN DEFAULT false,
  tipo_mascotas TEXT,
  numero_mascotas INTEGER,
  fecha_inicio_arrendamiento DATE NOT NULL,
  fecha_fin_arrendamiento DATE,
  valor_arrendamiento DECIMAL(12, 2),
  deposito_caution DECIMAL(12, 2),
  contrato_url TEXT,
  activo BOOLEAN DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(unidad_id, numero_documento, fecha_inicio_arrendamiento)
);

-- Tabla de Codeudores (avalistas)
CREATE TABLE IF NOT EXISTS codeudores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id UUID NOT NULL REFERENCES inquilinos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  numero_documento TEXT NOT NULL,
  tipo_documento TEXT DEFAULT 'CC',
  relacion TEXT, -- padres, empleador, otro
  direccion TEXT,
  ciudad TEXT,
  ocupacion TEXT,
  empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Convenios de Pago
CREATE TABLE IF NOT EXISTS convenios_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  propietario_id UUID REFERENCES propietarios(id) ON DELETE CASCADE,
  inquilino_id UUID REFERENCES inquilinos(id) ON DELETE CASCADE,
  numero_convenio TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  deuda_total DECIMAL(12, 2) NOT NULL,
  numero_cuotas INTEGER NOT NULL,
  valor_cuota DECIMAL(12, 2) NOT NULL,
  cuotas_pagadas INTEGER DEFAULT 0,
  cuotas_pendientes INTEGER,
  primer_pago DATE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  intereses_aplicados DECIMAL(12, 2) DEFAULT 0,
  tasa_interes DECIMAL(5, 2) DEFAULT 0,
  estado TEXT DEFAULT 'activo', -- activo, cumplido, incumplido, cancelado
  documento_url TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_propietarios_conjunto ON propietarios (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_propietarios_user ON propietarios (user_id);
CREATE INDEX IF NOT EXISTS idx_propietarios_numero_doc ON propietarios (numero_documento);
CREATE INDEX IF NOT EXISTS idx_propietarios_activo ON propietarios (activo);

CREATE INDEX IF NOT EXISTS idx_propietario_unidades_propietario ON propietario_unidades (propietario_id);
CREATE INDEX IF NOT EXISTS idx_propietario_unidades_unidad ON propietario_unidades (unidad_id);
CREATE INDEX IF NOT EXISTS idx_propietario_unidades_activo ON propietario_unidades (activo);

CREATE INDEX IF NOT EXISTS idx_inquilinos_conjunto ON inquilinos (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_inquilinos_unidad ON inquilinos (unidad_id);
CREATE INDEX IF NOT EXISTS idx_inquilinos_user ON inquilinos (user_id);
CREATE INDEX IF NOT EXISTS idx_inquilinos_numero_doc ON inquilinos (numero_documento);
CREATE INDEX IF NOT EXISTS idx_inquilinos_activo ON inquilinos (activo);
CREATE INDEX IF NOT EXISTS idx_inquilinos_fecha_fin ON inquilinos (fecha_fin_arrendamiento);

CREATE INDEX IF NOT EXISTS idx_codeudores_inquilino ON codeudores (inquilino_id);

CREATE INDEX IF NOT EXISTS idx_convenios_pago_conjunto ON convenios_pago (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_convenios_pago_propietario ON convenios_pago (propietario_id);
CREATE INDEX IF NOT EXISTS idx_convenios_pago_estado ON convenios_pago (estado);
CREATE INDEX IF NOT EXISTS idx_convenios_pago_numero ON convenios_pago (numero_convenio);

-- Comentarios de las tablas
COMMENT ON TABLE propietarios IS 'Registro de propietarios de unidades en los conjuntos';
COMMENT ON TABLE propietario_unidades IS 'Relación entre propietarios y unidades que poseen';
COMMENT ON TABLE inquilinos IS 'Registro de inquilinos arrendatarios de unidades';
COMMENT ON TABLE codeudores IS 'Avalistas o codeudores de contratos de arrendamiento';
COMMENT ON TABLE convenios_pago IS 'Acuerdos de pago fraccionado de deudas';
