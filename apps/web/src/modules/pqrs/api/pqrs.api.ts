import http from '@/shared/lib/http'
import type {
  Pqrs,
  PqrsCreatePayload,
  PqrsUpdatePayload,
  PqrsFilters,
  PaginatedPqrs,
  PqrsSeguimiento,
} from '../types/pqrs.types'

const BASE = '/pqrs'

export const pqrsApi = {
  list(filters: PqrsFilters = {}): Promise<PaginatedPqrs> {
    const params: Record<string, string | number> = {}
    if (filters.page)           params.page           = filters.page
    if (filters.limit)          params.limit          = filters.limit
    if (filters.conjuntoId)     params.conjuntoId     = filters.conjuntoId
    if (filters.unidadId)       params.unidadId       = filters.unidadId
    if (filters.tipo)           params.tipo           = filters.tipo
    if (filters.estado)         params.estado         = filters.estado
    if (filters.prioridad)      params.prioridad      = filters.prioridad
    if (filters.categoria)      params.categoria      = filters.categoria
    if (filters.numeroRadicado) params.numeroRadicado = filters.numeroRadicado
    return http.get<PaginatedPqrs>(BASE, { params }).then((r) => r.data)
  },

  getById(id: string): Promise<Pqrs> {
    return http.get<Pqrs>(`${BASE}/${id}`).then((r) => r.data)
  },

  getSeguimiento(id: string): Promise<PqrsSeguimiento[]> {
    return http.get<PqrsSeguimiento[]>(`${BASE}/${id}/seguimiento`).then((r) => r.data)
  },

  create(payload: PqrsCreatePayload): Promise<Pqrs> {
    return http.post<Pqrs>(BASE, payload).then((r) => r.data)
  },

  update(id: string, payload: PqrsUpdatePayload): Promise<Pqrs> {
    return http.patch<Pqrs>(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
}