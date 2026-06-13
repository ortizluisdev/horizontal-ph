export type TipoUsuario =
  | 'propietario'
  | 'inquilino'
  | 'administrador'
  | 'vigilante'
  | 'celadora'
  | 'aseadora'
  | 'otro'

export interface AuthUser {
  id: string
  nombre: string
  email: string
  role_id: string
  role_name: string
  unidad_id?: string
  tenant_id: string
  tipo_usuario: TipoUsuario
  activo: boolean
  created_at: string
  updated_at: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  nombre: string
  email: string
  password: string
  tenantId: string
  roleName?: string
  unidadId?: string
  tipoUsuario?: TipoUsuario
}

export interface RefreshToken {
  token: string
  expiresAt: string
}

export interface LoginResponse {
  token: string
  refresh: RefreshToken
  user: AuthUser
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}