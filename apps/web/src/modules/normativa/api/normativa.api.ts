import http from '@/shared/lib/http'
import type {
  Normativa, NormativaCreatePayload, NormativaUpdatePayload,
  NormativaFilters, PaginatedNormativa,
} from '../types/normativa.types'

const BASE = '/normativa'

export const normativaApi = {
  list(filters: NormativaFilters = {}): Promise<PaginatedNormativa> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.page)            params.page            = filters.page
    if (filters.limit)           params.limit           = filters.limit
    if (filters.conjuntoId)      params.conjuntoId      = filters.conjuntoId
    if (filters.tipo)            params.tipo            = filters.tipo
    if (filters.estado)          params.estado          = filters.estado
    if (filters.categoria_legal) params.categoria_legal = filters.categoria_legal
    if (filters.alcance)         params.alcance         = filters.alcance
    if (filters.search)          params.search          = filters.search
    if (filters.activo !== undefined) params.activo     = filters.activo
    return http.get<PaginatedNormativa>(BASE, { params }).then((r) => r.data)
  },

  getById(id: string): Promise<Normativa> {
    return http.get<Normativa>(`${BASE}/${id}`).then((r) => r.data)
  },

  create(payload: NormativaCreatePayload): Promise<Normativa> {
    return http.post<Normativa>(BASE, payload).then((r) => r.data)
  },

  update(id: string, payload: NormativaUpdatePayload): Promise<Normativa> {
    return http.patch<Normativa>(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  deactivate(id: string): Promise<void> {
    return http.patch(`${BASE}/${id}/desactivar`).then(() => undefined)
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
}
