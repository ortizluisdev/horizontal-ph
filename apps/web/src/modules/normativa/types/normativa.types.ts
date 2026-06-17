export type TipoDocumento =
  | 'reglamento_ph'
  | 'manual_convivencia'
  | 'acta_asamblea'
  | 'resolucion'
  | 'circular'
  | 'politica_interna'
  | 'contrato'
  | 'ley_decreto'
  | 'otro'

export type EstadoDocumento = 'borrador' | 'en_revision' | 'vigente' | 'derogado' | 'archivado'

export type AlcanceDocumento =
  | 'todos_propietarios'
  | 'consejo_administracion'
  | 'administracion'
  | 'comite_convivencia'
  | 'interno'

export type CategoriaLegal =
  | 'ley_675_2001'
  | 'decreto_reglamentario'
  | 'codigo_civil'
  | 'nsr_10'
  | 'norma_tecnica'
  | 'reglamento_interno'
  | 'decision_asamblea'
  | 'otra'

export interface Normativa {
  id: string
  conjunto_id: string
  titulo: string
  tipo: TipoDocumento
  categoria_legal?: CategoriaLegal | null
  estado: EstadoDocumento
  alcance: AlcanceDocumento
  numero_documento?: string | null
  version?: string | null
  descripcion?: string | null
  contenido?: string | null
  archivo_url?: string | null
  archivo_nombre?: string | null
  archivo_tamano?: number | null
  fecha_emision?: string | null
  fecha_vigencia_desde?: string | null
  fecha_vigencia_hasta?: string | null
  asamblea_id?: string | null
  aprobado_por?: string | null
  tags: string[]
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedNormativa {
  data: Normativa[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface NormativaCreatePayload {
  conjuntoId: string
  titulo: string
  tipo: TipoDocumento
  categoria_legal?: CategoriaLegal
  estado?: EstadoDocumento
  alcance?: AlcanceDocumento
  numero_documento?: string
  version?: string
  descripcion?: string
  contenido?: string
  archivo_url?: string
  archivo_nombre?: string
  archivo_tamano?: number
  fecha_emision?: string
  fecha_vigencia_desde?: string
  fecha_vigencia_hasta?: string
  asamblea_id?: string
  aprobado_por?: string
  tags?: string[]
}

export interface NormativaUpdatePayload {
  titulo?: string
  tipo?: TipoDocumento
  categoria_legal?: CategoriaLegal
  estado?: EstadoDocumento
  alcance?: AlcanceDocumento
  numero_documento?: string
  version?: string
  descripcion?: string
  contenido?: string
  archivo_url?: string
  archivo_nombre?: string
  archivo_tamano?: number
  fecha_emision?: string
  fecha_vigencia_desde?: string
  fecha_vigencia_hasta?: string
  aprobado_por?: string
  tags?: string[]
}

export interface NormativaFilters {
  page?: number
  limit?: number
  conjuntoId?: string
  tipo?: TipoDocumento | ''
  estado?: EstadoDocumento | ''
  categoria_legal?: CategoriaLegal | ''
  alcance?: AlcanceDocumento | ''
  search?: string
  activo?: boolean
}
