import http from '@/shared/lib/http'
import type {
  Cobranza,
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  RegistrarPagoPayload,
  CobranzaFilters,
  PaginatedCobranzas,
  ResumenCobranza,
} from '../types/cobranza.types'

const BASE = '/cobranza'

export const cobranzaApi = {
  /** GET /cobranza — lista paginada con filtros */
  list(filters: CobranzaFilters = {}): Promise<PaginatedCobranzas> {
    const params: Record<string, string | number> = {}
    if (filters.page)        params.page        = filters.page
    if (filters.limit)       params.limit       = filters.limit
    if (filters.conjuntoId)  params.conjuntoId  = filters.conjuntoId
    if (filters.unidadId)    params.unidadId    = filters.unidadId
    if (filters.estado)      params.estado      = filters.estado
    if (filters.fechaDesde)  params.fechaDesde  = filters.fechaDesde
    if (filters.fechaHasta)  params.fechaHasta  = filters.fechaHasta
    if (filters.mes)         params.mes         = filters.mes
    if (filters.anio)        params.anio        = filters.anio
    return http.get<PaginatedCobranzas>(BASE, { params }).then((r) => r.data)
  },

  /** GET /cobranza/:id */
  getById(id: string): Promise<Cobranza> {
    return http.get<Cobranza>(`${BASE}/${id}`).then((r) => r.data)
  },

  /** GET /cobranza/resumen?conjuntoId=&unidadId= */
  resumen(conjuntoId: string, unidadId?: string): Promise<ResumenCobranza> {
    const params: Record<string, string> = { conjuntoId }
    if (unidadId) params.unidadId = unidadId
    return http.get<ResumenCobranza>(`${BASE}/resumen`, { params }).then((r) => r.data)
  },

  /** POST /cobranza (admin) */
  create(payload: CobranzaCreatePayload): Promise<Cobranza> {
    return http.post<Cobranza>(BASE, payload).then((r) => r.data)
  },

  /** PATCH /cobranza/:id (admin) */
  update(id: string, payload: CobranzaUpdatePayload): Promise<Cobranza> {
    return http.patch<Cobranza>(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  /** POST /cobranza/:id/pago (admin) */
  registrarPago(id: string, payload: RegistrarPagoPayload): Promise<Cobranza> {
    return http.post<Cobranza>(`${BASE}/${id}/pago`, payload).then((r) => r.data)
  },

  /** DELETE /cobranza/:id (admin — solo pendiente o anulada) */
  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
}