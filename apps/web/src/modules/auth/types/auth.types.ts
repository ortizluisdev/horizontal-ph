// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoUsuario =
  | 'propietario'
  | 'inquilino'
  | 'administrador'
  | 'vigilante'
  | 'celadora'
  | 'aseadora'
  | 'otro'

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface User {
  id: string
  nombre: string
  email: string
  role_id: string | null
  role_name: string | null
  unidad_id: string | null
  tenant_id: string
  tipo_usuario: TipoUsuario
  activo: boolean
  created_at: string
  updated_at: string
}

export interface RefreshTokenPayload {
  token: string
  expiresAt: string
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nombre: string
  email: string
  password: string
  tenantId: string
  roleName?: string
  unidadId?: string
  tipoUsuario?: TipoUsuario
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  refresh: RefreshTokenPayload
  user: User
}

export interface RefreshResponse {
  token: string
  refresh: RefreshTokenPayload
}

// ─── Form state ───────────────────────────────────────────────────────────────

export interface FieldError {
  field: string
  message: string
}

export interface AuthFormState {
  loading: boolean
  error: string | null
  fieldErrors: FieldError[]
}
