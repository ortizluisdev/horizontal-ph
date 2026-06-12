import http from '@/shared/lib/http'
import type {
  Cobranza,
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  CobranzaFilters,
  PaginatedCobranzas,
} from '../types/cobranza.types'

const BASE = '/cobranza'

export const cobranzaApi = {
  /**
   * GET /cobranza
   * Lista paginada con filtros opcionales
   */
  list(filters: CobranzaFilters = {}): Promise<PaginatedCobranzas> {
    const params: Record<string, string | number> = {}
    if (filters.page)        params.page        = filters.page
    if (filters.limit)       params.limit       = filters.limit
    if (filters.conjuntoId)  params.conjuntoId  = filters.conjuntoId
    if (filters.unidadId)    params.unidadId    = filters.unidadId
    if (filters.estado)      params.estado      = filters.estado
    if (filters.fechaDesde)  params.fechaDesde  = filters.fechaDesde
    if (filters.fechaHasta)  params.fechaHasta  = filters.fechaHasta
    return http.get<PaginatedCobranzas>(BASE, { params }).then((r) => r.data)
  },

  /**
   * GET /cobranza/:id
   */
  getById(id: string): Promise<Cobranza> {
    return http.get<Cobranza>(`${BASE}/${id}`).then((r) => r.data)
  },

  /**
   * POST /cobranza  (admin only)
   */
  create(payload: CobranzaCreatePayload): Promise<Cobranza> {
    return http.post<Cobranza>(BASE, payload).then((r) => r.data)
  },

  /**
   * PATCH /cobranza/:id  (admin only)
   */
  update(id: string, payload: CobranzaUpdatePayload): Promise<Cobranza> {
    return http.patch<Cobranza>(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  /**
   * DELETE /cobranza/:id  (admin only — solo pendiente o anulada)
   */
  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
}