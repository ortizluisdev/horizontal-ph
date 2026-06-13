import http from '@/shared/lib/http'
import type {
  Asamblea,
  AsambleaCreatePayload,
  AsambleaUpdatePayload,
  AsambleaFilters,
  PaginatedAsambleas,
} from '../types/asambleas.types'

const BASE = '/asambleas'

export const asambleasApi = {
  list(filters: AsambleaFilters = {}): Promise<PaginatedAsambleas> {
    const params: Record<string, string | number> = {}
    if (filters.page)        params.page        = filters.page
    if (filters.limit)       params.limit       = filters.limit
    if (filters.conjuntoId)  params.conjuntoId  = filters.conjuntoId
    if (filters.tipo)        params.tipo        = filters.tipo
    if (filters.estado)      params.estado      = filters.estado
    if (filters.fechaDesde)  params.fechaDesde  = filters.fechaDesde
    if (filters.fechaHasta)  params.fechaHasta  = filters.fechaHasta
    return http.get<PaginatedAsambleas>(BASE, { params }).then((r) => r.data)
  },

  getById(id: string): Promise<Asamblea> {
    return http.get<Asamblea>(`${BASE}/${id}`).then((r) => r.data)
  },

  create(payload: AsambleaCreatePayload): Promise<Asamblea> {
    return http.post<Asamblea>(BASE, payload).then((r) => r.data)
  },

  update(id: string, payload: AsambleaUpdatePayload): Promise<Asamblea> {
    return http.patch<Asamblea>(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
}