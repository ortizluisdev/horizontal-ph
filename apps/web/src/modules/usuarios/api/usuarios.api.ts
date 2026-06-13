import http from '@/shared/lib/http'
import type {
  Usuario, UsuarioCreatePayload, UsuarioUpdatePayload,
  UsuarioFilters, PaginatedUsuarios,
} from '../types/usuarios.types'

const BASE = '/usuarios'

export const usuariosApi = {
  list(filters: UsuarioFilters = {}): Promise<PaginatedUsuarios> {
    const params: Record<string, string | number> = {}
    if (filters.page)         params.page         = filters.page
    if (filters.limit)        params.limit        = filters.limit
    if (filters.search)       params.search       = filters.search
    if (filters.tipo_usuario) params.tipo_usuario = filters.tipo_usuario
    if (filters.estado)       params.estado       = filters.estado
    if (filters.conjunto_id)  params.conjunto_id  = filters.conjunto_id
    return http.get<PaginatedUsuarios>(BASE, { params }).then(r => r.data)
  },

  getById(id: string): Promise<Usuario> {
    return http.get<Usuario>(`${BASE}/${id}`).then(r => r.data)
  },

  create(payload: UsuarioCreatePayload): Promise<Usuario> {
    return http.post<Usuario>(BASE, payload).then(r => r.data)
  },

  update(id: string, payload: UsuarioUpdatePayload): Promise<Usuario> {
    return http.patch<Usuario>(`${BASE}/${id}`, payload).then(r => r.data)
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },

  cambiarEstado(id: string, estado: Usuario['estado']): Promise<Usuario> {
    return http.patch<Usuario>(`${BASE}/${id}/estado`, { estado }).then(r => r.data)
  },

  resetPassword(id: string): Promise<{ message: string }> {
    return http.post<{ message: string }>(`${BASE}/${id}/reset-password`).then(r => r.data)
  },
}