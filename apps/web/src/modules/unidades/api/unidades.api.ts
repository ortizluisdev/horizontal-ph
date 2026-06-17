import http from '@/shared/lib/http'
import type { PaginatedResponse } from '@/shared/types'
import type { Unidad, UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from '../types/unidades.types'

export const unidadesApi = {
  list(params?: UnidadQuery) {
    return http.get<PaginatedResponse<Unidad>>('/unidades', { params })
  },

  getById(id: string) {
    return http.get<Unidad>(`/unidades/${id}`)
  },

  listByConjunto(conjuntoId: string) {
    return http.get<Unidad[]>(`/conjuntos/${conjuntoId}/unidades`)
  },

  create(body: UnidadCreateInput) {
    return http.post<Unidad>('/unidades', body)
  },

  update(id: string, body: UnidadUpdateInput) {
    return http.patch<Unidad>(`/unidades/${id}`, body)
  },

  deactivate(id: string) {
    return http.patch<Unidad>(`/unidades/${id}/desactivar`)
  },

  remove(id: string) {
    return http.delete<void>(`/unidades/${id}`)
  },
}