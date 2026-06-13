import http from '@/shared/lib/http'
import type { PaginatedResponse } from '@/shared/types'
import type { Cobranza, CobranzaCreateInput, CobranzaUpdateInput, CobranzaQuery } from '../types/cobranza.types'

export const cobranzaApi = {
  list(params?: CobranzaQuery) {
    return http.get<PaginatedResponse<Cobranza>>('/cobranza', { params })
  },

  getById(id: string) {
    return http.get<Cobranza>(`/cobranza/${id}`)
  },

  create(body: CobranzaCreateInput) {
    return http.post<Cobranza>('/cobranza', body)
  },

  update(id: string, body: CobranzaUpdateInput) {
    return http.patch<Cobranza>(`/cobranza/${id}`, body)
  },

  remove(id: string) {
    return http.delete<{ ok: boolean }>(`/cobranza/${id}`)
  },
}