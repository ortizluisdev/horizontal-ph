export type TipoUsuario =
  | 'super_admin'
  | 'admin_conjunto'
  | 'propietario'
  | 'residente'
  | 'empleado'
  | 'contador'
  | 'vigilante'

export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido' | 'pendiente'

export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono?: string | null
  tipo_usuario: TipoUsuario
  role_name?: string | null
  estado: EstadoUsuario
  conjunto_id?: string | null
  conjunto_nombre?: string | null
  unidad_id?: string | null
  unidad_numero?: string | null
  avatar_url?: string | null
  ultimo_acceso?: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedUsuarios {
  data: Usuario[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface UsuarioCreatePayload {
  nombre: string
  email: string
  password: string
  telefono?: string
  tipo_usuario: TipoUsuario
  estado: EstadoUsuario
  conjunto_id?: string
  unidad_id?: string
}

export interface UsuarioUpdatePayload {
  nombre?: string
  email?: string
  telefono?: string
  tipo_usuario?: TipoUsuario
  estado?: EstadoUsuario
  conjunto_id?: string
  unidad_id?: string
}

export interface UsuarioFilters {
  page?: number
  limit?: number
  search?: string
  tipo_usuario?: TipoUsuario | ''
  estado?: EstadoUsuario | ''
  conjunto_id?: string
}