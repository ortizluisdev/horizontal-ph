-- 010_create_refresh_tokens.sql
-- Tabla para almacenar refresh tokens (hashed)
-- Gestiona tokens de renovación para mantener sesiones seguras

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_family TEXT, -- para detectar token reuse
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  revoke_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  device_name TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de sesiones de refresh tokens para auditoría
CREATE TABLE IF NOT EXISTS refresh_token_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refresh_token_id UUID NOT NULL REFERENCES refresh_tokens(id) ON DELETE CASCADE,
  accion TEXT NOT NULL, -- created, used, revoked
  ip_address INET,
  user_agent TEXT,
  fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de blacklist de tokens comprometidos
CREATE TABLE IF NOT EXISTS token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL, -- access, refresh
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razon TEXT, -- logout, password_change, compromised, other
  fecha_blacklist TIMESTAMP WITH TIME ZONE DEFAULT now(),
  vence_at TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens (revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens (user_id, revoked, expires_at) WHERE revoked = false;

CREATE INDEX IF NOT EXISTS idx_refresh_token_audit_token ON refresh_token_audit (refresh_token_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_audit_accion ON refresh_token_audit (accion);
CREATE INDEX IF NOT EXISTS idx_refresh_token_audit_fecha ON refresh_token_audit (fecha_accion);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_token_hash ON token_blacklist (token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user ON token_blacklist (user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_type ON token_blacklist (token_type);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_vence ON token_blacklist (vence_at);

-- Comentarios de las tablas
COMMENT ON TABLE refresh_tokens IS 'Tokens de renovación para mantener sesiones activas de forma segura';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'Hash del token (nunca almacenar el token en texto plano)';
COMMENT ON COLUMN refresh_tokens.revoked IS 'Indica si el token ha sido revocado';
COMMENT ON TABLE refresh_token_audit IS 'Auditoría de uso y cambios en refresh tokens';
COMMENT ON TABLE token_blacklist IS 'Blacklist de tokens comprometidos o revocados';

