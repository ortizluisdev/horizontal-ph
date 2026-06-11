-- 009_create_auth.sql
-- Tablas para autenticación, roles y permisos
-- Sistema completo de gestión de usuarios, roles y control de acceso

CREATE TABLE IF NOT EXISTS auth_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  nivel_acceso INTEGER DEFAULT 0, -- 0: basic, 1: staff, 2: admin, 3: super-admin
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(nombre)
);

CREATE TABLE IF NOT EXISTS auth_permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  modulo TEXT NOT NULL, -- asambleas, cobranza, contabilidad, pqrs, usuarios, etc.
  accion TEXT NOT NULL, -- crear, leer, actualizar, eliminar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_roles_permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES auth_roles(id) ON DELETE CASCADE,
  permiso_id UUID NOT NULL REFERENCES auth_permisos(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role_id UUID REFERENCES auth_roles(id) ON DELETE SET NULL,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  conjunto_id UUID REFERENCES conjuntos(id) ON DELETE SET NULL,
  tipo_usuario TEXT NOT NULL, -- propietario, inquilino, administrador, vigilante, celadora, aseadora, otro
  telefono TEXT,
  documento_identificacion TEXT,
  numero_documento TEXT UNIQUE,
  url_foto TEXT,
  activo BOOLEAN DEFAULT true,
  verificado BOOLEAN DEFAULT false,
  fecha_verificacion TIMESTAMP WITH TIME ZONE,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  intento_fallidos_login INTEGER DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false,
  fecha_bloqueo TIMESTAMP WITH TIME ZONE,
  razon_bloqueo TEXT,
  aceptado_terminos BOOLEAN DEFAULT true,
  fecha_aceptacion_terminos TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_id, email),
  UNIQUE(tenant_id, numero_documento)
);

-- Tabla de Sesiones activas de usuarios
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_name TEXT,
  os_name TEXT,
  browser_name TEXT,
  es_mobile BOOLEAN DEFAULT false,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  activa BOOLEAN DEFAULT true
);

-- Tabla de Auditoría de cambios de usuario
CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accion TEXT NOT NULL, -- login, logout, cambio_password, cambio_email, actualizar_perfil, etc.
  descripcion TEXT,
  ip_address INET,
  user_agent TEXT,
  cambios_anteriores JSONB,
  cambios_nuevos JSONB,
  fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  realizado_por UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_auth_roles_activo ON auth_roles (activo);
CREATE INDEX IF NOT EXISTS idx_auth_permisos_modulo ON auth_permisos (modulo);
CREATE INDEX IF NOT EXISTS idx_auth_roles_permisos_role ON auth_roles_permisos (role_id);
CREATE INDEX IF NOT EXISTS idx_auth_roles_permisos_permiso ON auth_roles_permisos (permiso_id);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_users_unidad_id ON users (unidad_id);
CREATE INDEX IF NOT EXISTS idx_users_conjunto_id ON users (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_users_activo ON users (activo);
CREATE INDEX IF NOT EXISTS idx_users_bloqueado ON users (bloqueado);
CREATE INDEX IF NOT EXISTS idx_users_tipo_usuario ON users (tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activa ON user_sessions (activa);

CREATE INDEX IF NOT EXISTS idx_user_audit_log_user ON user_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_accion ON user_audit_log (accion);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_fecha ON user_audit_log (fecha_accion);

-- Insertar roles iniciales
INSERT INTO auth_roles (nombre, descripcion, nivel_acceso)
VALUES
  ('propietario', 'Propietario del inmueble', 1),
  ('inquilino', 'Inquilino o arrendatario', 1),
  ('administrador', 'Administrador del conjunto', 2),
  ('vigilante', 'Personal de seguridad', 1),
  ('celadora', 'Personal de limpieza', 1),
  ('aseadora', 'Personal de limpieza adicional', 1),
  ('contador', 'Personal de contabilidad', 2),
  ('gerente', 'Gerente del conjunto', 3),
  ('super-admin', 'Super administrador del sistema', 3)
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios de las tablas
COMMENT ON TABLE auth_roles IS 'Roles de usuarios del sistema';
COMMENT ON TABLE auth_permisos IS 'Permisos individuales del sistema';
COMMENT ON TABLE auth_roles_permisos IS 'Asociación entre roles y permisos';
COMMENT ON TABLE users IS 'Usuarios del sistema con autenticación y roles';
COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios';
COMMENT ON TABLE user_audit_log IS 'Auditoría de acciones realizadas por usuarios';

