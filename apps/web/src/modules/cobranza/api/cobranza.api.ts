import http from '@/shared/lib/http'
import type { PaginatedResponse } from '@/shared/types'
import type {
  Cobranza,
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  CobranzaFilters,
} from '../types/cobranza.types'

const BASE = '/cobranza'

export const cobranzaApi = {
  list(filters: CobranzaFilters = {}) {
    const params: Record<string, string | number> = {}
    if (filters.page)       params.page       = filters.page
    if (filters.limit)      params.limit      = filters.limit
    if (filters.conjuntoId) params.conjuntoId = filters.conjuntoId
    if (filters.unidadId)   params.unidadId   = filters.unidadId
    if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde
    if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta
    if (filters.search)     params.search     = filters.search
    // Solo enviar estado si es un valor real (no string vacío)
    if (filters.estado)     params.estado     = filters.estado
    return http.get<PaginatedResponse<Cobranza>>(BASE, { params })
  },

  getById(id: string) {
    return http.get<Cobranza>(`${BASE}/${id}`)
  },

  create(payload: CobranzaCreatePayload) {
    return http.post<Cobranza>(BASE, payload)
  },

  update(id: string, payload: CobranzaUpdatePayload) {
    return http.patch<Cobranza>(`${BASE}/${id}`, payload)
  },

  remove(id: string) {
    return http.delete<void>(`${BASE}/${id}`)
  },
}