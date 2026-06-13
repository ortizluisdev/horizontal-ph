import http from '@/shared/lib/http'
import type {
  Normativa, NormativaCreatePayload, NormativaUpdatePayload,
  NormativaFilters, PaginatedNormativa,
} from '../types/normativa.types'

const BASE = '/normativa'

export const normativaApi = {
  list(filters: NormativaFilters = {}): Promise<PaginatedNormativa> {
    const params: Record<string, string | number> = {}
    if (filters.page)            params.page            = filters.page
    if (filters.limit)           params.limit           = filters.limit
    if (filters.conjuntoId)      params.conjuntoId      = filters.conjuntoId
    if (filters.tipo)            params.tipo            = filters.tipo
    if (filters.estado)          params.estado          = filters.estado
    if (filters.categoria_legal) params.categoria_legal = filters.categoria_legal
    if (filters.alcance)         params.alcance         = filters.alcance
    if (filters.fechaDesde)      params.fechaDesde      = filters.fechaDesde
    if (filters.fechaHasta)      params.fechaHasta      = filters.fechaHasta
    if (filters.search)          params.search          = filters.search
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
  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
  uploadArchivo(id: string, file: File): Promise<{ url: string; nombre: string; tamano: number }> {
    const fd = new FormData()
    fd.append('file', file)
    return http.post(`${BASE}/${id}/archivo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}