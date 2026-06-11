-- 002_create_conjuntos.sql
-- Tabla de Conjuntos Residenciales (edificios, torres, ciudadelas)
-- Cada conjunto pertenece a un tenant específico

CREATE TABLE IF NOT EXISTS conjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT,
  departamento TEXT,
  pais TEXT DEFAULT 'Colombia',
  codigo_catastral TEXT UNIQUE,
  tipo_conjunto TEXT NOT NULL, -- edificio, casa, ciudadela, condominio
  numero_torres INTEGER,
  numero_unidades INTEGER,
  anio_construccion INTEGER,
  area_total_m2 DECIMAL(10, 2),
  area_comun_m2 DECIMAL(10, 2),
  administrador_nombre TEXT,
  administrador_email TEXT,
  administrador_telefono TEXT,
  telefono_emergencia TEXT,
  email_contacto TEXT,
  logo_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_conjuntos_tenant_id ON conjuntos (tenant_id);
CREATE INDEX IF NOT EXISTS idx_conjuntos_nombre ON conjuntos (nombre);
CREATE INDEX IF NOT EXISTS idx_conjuntos_ciudad ON conjuntos (ciudad);
CREATE INDEX IF NOT EXISTS idx_conjuntos_activo ON conjuntos (activo);
CREATE INDEX IF NOT EXISTS idx_conjuntos_tipo ON conjuntos (tipo_conjunto);
CREATE INDEX IF NOT EXISTS idx_conjuntos_created_at ON conjuntos (created_at);

-- Comentarios de la tabla
COMMENT ON TABLE conjuntos IS 'Conjuntos residenciales (edificios, torres, ciudadelas, etc.)';
COMMENT ON COLUMN conjuntos.tenant_id IS 'Referencia al tenant propietario del conjunto';
COMMENT ON COLUMN conjuntos.codigo_catastral IS 'Código catastral único del inmueble';
COMMENT ON COLUMN conjuntos.tipo_conjunto IS 'Tipo de conjunto: edificio, casa, ciudadela, condominio';
