-- 001_create_tenants.sql
-- Tabla de Tenants para soporte multi-tenancy
-- Cada tenant representa una organización o empresa independiente

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  razon_social TEXT NOT NULL UNIQUE,
  nit TEXT UNIQUE,
  email_contacto TEXT,
  telefono_contacto TEXT,
  direccion TEXT,
  ciudad TEXT,
  pais TEXT DEFAULT 'Colombia',
  activo BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'basic', -- basic, professional, enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_tenants_razon_social ON tenants (razon_social);
CREATE INDEX IF NOT EXISTS idx_tenants_nit ON tenants (nit);
CREATE INDEX IF NOT EXISTS idx_tenants_activo ON tenants (activo);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants (plan);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants (created_at);

-- Comentarios de la tabla
COMMENT ON TABLE tenants IS 'Tabla de organizaciones/empresas para soporte multi-tenancy';
COMMENT ON COLUMN tenants.id IS 'Identificador único del tenant';
COMMENT ON COLUMN tenants.razon_social IS 'Razón social de la empresa (debe ser única)';
COMMENT ON COLUMN tenants.plan IS 'Plan de suscripción: basic, professional, enterprise';
