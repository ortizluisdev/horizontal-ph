-- 009_create_auth.sql
-- Tablas para autenticación y roles

CREATE TABLE IF NOT EXISTS auth_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role_id UUID REFERENCES auth_roles(id) ON DELETE SET NULL,
  unidad_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_unidad ON users (unidad_id);

-- Datos iniciales de roles
INSERT INTO auth_roles (id, name, description)
  VALUES
    (gen_random_uuid(), 'propietario', 'Propietario del inmueble')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO auth_roles (id, name, description)
  VALUES
    (gen_random_uuid(), 'inquilino', 'Inquilino o arrendatario')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO auth_roles (id, name, description)
  VALUES
    (gen_random_uuid(), 'administrador', 'Administrador del conjunto')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO auth_roles (id, name, description)
  VALUES
    (gen_random_uuid(), 'vigilante', 'Personal de seguridad')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO auth_roles (id, name, description)
  VALUES
    (gen_random_uuid(), 'celadora', 'Personal de limpieza')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO auth_roles (id, name, description)
  VALUES
    (gen_random_uuid(), 'aseadora', 'Personal de limpieza adicional')
  ON CONFLICT (name) DO NOTHING;
