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
  list(filters: PqrsFilters = {}): Promise<{ data: PaginatedPqrs }> {
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
    return http.get<PaginatedPqrs>(BASE, { params })
  },

  getById(id: string): Promise<{ data: Pqrs }> {
    return http.get<Pqrs>(`${BASE}/${id}`)
  },

  getSeguimiento(id: string): Promise<{ data: PqrsSeguimiento[] }> {
    return http.get<PqrsSeguimiento[]>(`${BASE}/${id}/seguimiento`)
  },

  create(payload: PqrsCreatePayload): Promise<{ data: Pqrs }> {
    return http.post<Pqrs>(BASE, payload)
  },

  update(id: string, payload: PqrsUpdatePayload): Promise<{ data: Pqrs }> {
    return http.patch<Pqrs>(`${BASE}/${id}`, payload)
  },

  deactivate(id: string): Promise<void> {
    return http.patch(`${BASE}/${id}/desactivar`).then(() => undefined)
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },
}
