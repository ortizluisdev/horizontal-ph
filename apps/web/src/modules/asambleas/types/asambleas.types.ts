export type TipoAsamblea   = 'ordinaria' | 'extraordinaria' | 'de_propietarios' | 'de_consejo' | 'otra'
export type EstadoAsamblea = 'programada' | 'en_curso' | 'realizada' | 'cancelada' | 'pospuesta'

export interface Asamblea {
  id: string
  conjunto_id: string
  numero_acta: string
  tipo: TipoAsamblea
  asunto: string
  fecha_programada: string
  lugar?: string | null
  quorum_requerido?: number | null
  estado: EstadoAsamblea
  notas?: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedAsambleas {
  data: Asamblea[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface AsambleaCreatePayload {
  conjuntoId: string
  numero_acta: string
  tipo: TipoAsamblea
  asunto: string
  fecha_programada: string
  lugar?: string
  quorum_requerido?: number
  notas?: string
}

export interface AsambleaUpdatePayload {
  numero_acta?: string
  tipo?: TipoAsamblea
  asunto?: string
  fecha_programada?: string
  lugar?: string
  quorum_requerido?: number
  notas?: string
  estado?: EstadoAsamblea
}

export interface AsambleaFilters {
  page?: number
  limit?: number
  conjuntoId?: string
  tipo?: TipoAsamblea | ''
  estado?: EstadoAsamblea | ''
  fechaDesde?: string
  fechaHasta?: string
}