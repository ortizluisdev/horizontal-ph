export type TipoAsamblea =
  | 'ordinaria'
  | 'extraordinaria'
  | 'de_propietarios'
  | 'de_consejo'
  | 'otra'

export type EstadoAsamblea =
  | 'programada'
  | 'en_curso'
  | 'realizada'
  | 'cancelada'
  | 'pospuesta'

export interface Asamblea {
  id: string
  conjunto_id: string
  numero_acta: string
  tipo: TipoAsamblea
  asunto: string
  fecha_programada: string
  lugar?: string
  quorum_requerido?: number
  estado: EstadoAsamblea
  notas?: string
  created_at: string
  updated_at: string
}

export interface AsambleaCreateInput {
  conjuntoId: string
  numero_acta: string
  tipo: TipoAsamblea
  asunto: string
  fecha_programada: string
  lugar?: string
  quorum_requerido?: number
  notas?: string
}

export interface AsambleaUpdateInput {
  numero_acta?: string
  tipo?: TipoAsamblea
  asunto?: string
  fecha_programada?: string
  lugar?: string
  quorum_requerido?: number
  notas?: string
  estado?: EstadoAsamblea
}

export interface AsambleaQuery {
  page?: number
  limit?: number
  conjuntoId?: string
  tipo?: TipoAsamblea
  estado?: EstadoAsamblea
  fechaDesde?: string
  fechaHasta?: string
}
