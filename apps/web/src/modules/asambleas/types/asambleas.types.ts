export type TipoAsamblea   = 'ordinaria' | 'extraordinaria' | 'de_propietarios' | 'de_consejo' | 'otra'
export type EstadoAsamblea = 'programada' | 'en_curso' | 'realizada' | 'cancelada' | 'pospuesta'
export type ResultadoVotacion = 'aprobado' | 'rechazado' | 'aplazado'
export type EstadoAcuerdo = 'pendiente' | 'en progreso' | 'cumplido' | 'no cumplido'

export interface Asamblea {
  id: string
  conjunto_id: string
  numero_acta: string
  tipo: TipoAsamblea
  asunto: string
  descripcion?: string | null
  fecha_programada: string
  fecha_realizada?: string | null
  lugar?: string | null
  presidente_nombre?: string | null
  secretario_nombre?: string | null
  quorum_requerido?: number | null
  asistentes_presente?: number | null
  asistentes_ausentes?: number | null
  representantes?: number | null
  votacion_requerida?: boolean
  estado: EstadoAsamblea
  documento_acta_url?: string | null
  adjunto_url?: string | null
  observaciones?: string | null
  activo: boolean
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
}

export interface AsambleaVotacion {
  id: string
  asamblea_id: string
  numero_votacion: number
  tema: string
  descripcion?: string | null
  votos_a_favor: number
  votos_en_contra: number
  abstenciones: number
  resultado?: ResultadoVotacion | null
  observaciones?: string | null
  created_at: string
}

export interface AsambleaAcuerdo {
  id: string
  asamblea_id: string
  numero_acuerdo: number
  descripcion: string
  responsable_nombre?: string | null
  responsable_id?: string | null
  fecha_vencimiento?: string | null
  estado: EstadoAcuerdo
  observaciones?: string | null
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
  descripcion?: string
  fecha_programada: string
  lugar?: string
  presidente_nombre?: string
  secretario_nombre?: string
  quorum_requerido?: number
  votacion_requerida?: boolean
  observaciones?: string
}

export interface AsambleaUpdatePayload {
  numero_acta?: string
  tipo?: TipoAsamblea
  asunto?: string
  descripcion?: string
  fecha_programada?: string
  fecha_realizada?: string
  lugar?: string
  presidente_nombre?: string
  secretario_nombre?: string
  quorum_requerido?: number
  asistentes_presente?: number
  asistentes_ausentes?: number
  representantes?: number
  votacion_requerida?: boolean
  estado?: EstadoAsamblea
  documento_acta_url?: string
  adjunto_url?: string
  observaciones?: string
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

export interface VotacionCreatePayload {
  tema: string
  descripcion?: string
  votos_a_favor?: number
  votos_en_contra?: number
  abstenciones?: number
  resultado?: ResultadoVotacion
  observaciones?: string
}

export interface VotacionUpdatePayload extends Partial<VotacionCreatePayload> {}

export interface AcuerdoCreatePayload {
  descripcion: string
  responsable_nombre?: string
  fecha_vencimiento?: string
  observaciones?: string
}

export interface AcuerdoUpdatePayload {
  descripcion?: string
  responsable_nombre?: string
  fecha_vencimiento?: string
  estado?: EstadoAcuerdo
  observaciones?: string
}
