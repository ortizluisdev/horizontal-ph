import http from '@/shared/lib/http'
import type { PaginatedResponse } from '@/shared/types'
import type { Conjunto, ConjuntoCreateInput, ConjuntoUpdateInput, ConjuntoQuery } from '../types/conjuntos.types'

export const conjuntosApi = {
  list(params?: ConjuntoQuery) {
    return http.get<PaginatedResponse<Conjunto>>('/conjuntos', { params })
  },

  getById(id: string) {
    return http.get<Conjunto>(`/conjuntos/${id}`)
  },

  create(body: ConjuntoCreateInput) {
    return http.post<Conjunto>('/conjuntos', body)
  },

  update(id: string, body: ConjuntoUpdateInput) {
    return http.patch<Conjunto>(`/conjuntos/${id}`, body)
  },

  deactivate(id: string) {
    return http.patch<Conjunto>(`/conjuntos/${id}/desactivar`)
  },

  remove(id: string) {
    return http.delete<{ ok: boolean }>(`/conjuntos/${id}`)
  },
}