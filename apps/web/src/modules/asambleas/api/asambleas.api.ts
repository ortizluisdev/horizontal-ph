import http from '@/shared/lib/http'
import type {
  Asamblea,
  AsambleaCreatePayload,
  AsambleaUpdatePayload,
  AsambleaFilters,
  PaginatedAsambleas,
  AsambleaVotacion,
  VotacionCreatePayload,
  VotacionUpdatePayload,
  AsambleaAcuerdo,
  AcuerdoCreatePayload,
  AcuerdoUpdatePayload,
} from '../types/asambleas.types'

const BASE = '/asambleas'

export const asambleasApi = {
  list(filters: AsambleaFilters = {}): Promise<PaginatedAsambleas> {
    const params: Record<string, string | number> = {}
    if (filters.page)       params.page       = filters.page
    if (filters.limit)      params.limit      = filters.limit
    if (filters.conjuntoId) params.conjuntoId = filters.conjuntoId
    if (filters.tipo)       params.tipo       = filters.tipo
    if (filters.estado)     params.estado     = filters.estado
    if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde
    if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta
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

  deactivate(id: string): Promise<void> {
    return http.patch(`${BASE}/${id}/desactivar`).then(() => undefined)
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined)
  },

  // ── Votaciones ──────────────────────────────────────────────────────────────

  listVotaciones(asambleaId: string): Promise<AsambleaVotacion[]> {
    return http.get<AsambleaVotacion[]>(`${BASE}/${asambleaId}/votaciones`).then((r) => r.data)
  },

  createVotacion(asambleaId: string, payload: VotacionCreatePayload): Promise<AsambleaVotacion> {
    return http.post<AsambleaVotacion>(`${BASE}/${asambleaId}/votaciones`, payload).then((r) => r.data)
  },

  updateVotacion(asambleaId: string, votacionId: string, payload: VotacionUpdatePayload): Promise<AsambleaVotacion> {
    return http.patch<AsambleaVotacion>(`${BASE}/${asambleaId}/votaciones/${votacionId}`, payload).then((r) => r.data)
  },

  deleteVotacion(asambleaId: string, votacionId: string): Promise<void> {
    return http.delete(`${BASE}/${asambleaId}/votaciones/${votacionId}`).then(() => undefined)
  },

  // ── Acuerdos ────────────────────────────────────────────────────────────────

  listAcuerdos(asambleaId: string): Promise<AsambleaAcuerdo[]> {
    return http.get<AsambleaAcuerdo[]>(`${BASE}/${asambleaId}/acuerdos`).then((r) => r.data)
  },

  createAcuerdo(asambleaId: string, payload: AcuerdoCreatePayload): Promise<AsambleaAcuerdo> {
    return http.post<AsambleaAcuerdo>(`${BASE}/${asambleaId}/acuerdos`, payload).then((r) => r.data)
  },

  updateAcuerdo(asambleaId: string, acuerdoId: string, payload: AcuerdoUpdatePayload): Promise<AsambleaAcuerdo> {
    return http.patch<AsambleaAcuerdo>(`${BASE}/${asambleaId}/acuerdos/${acuerdoId}`, payload).then((r) => r.data)
  },

  deleteAcuerdo(asambleaId: string, acuerdoId: string): Promise<void> {
    return http.delete(`${BASE}/${asambleaId}/acuerdos/${acuerdoId}`).then(() => undefined)
  },
}
