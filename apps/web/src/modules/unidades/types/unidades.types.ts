import type { PaginationParams } from '@/shared/types'

export type TipoUnidad =
  | 'apartamento'
  | 'casa'
  | 'local_comercial'
  | 'oficina'
  | 'bodega'
  | 'parqueadero'
  | 'otro'

export interface Unidad {
  id: string
  nombre: string
  descripcion?: string | null
  conjunto_id: string
  conjunto_nombre?: string | null
  tipo_unidad?: TipoUnidad | null
  numero_unidad?: string | null
  piso?: number | null
  area_m2?: number | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface UnidadCreateInput {
  conjuntoId: string
  nombre: string
  descripcion?: string
  tipo_unidad?: TipoUnidad
  numero_unidad?: string
  piso?: number
  area_m2?: number
}

export interface UnidadUpdateInput {
  nombre?: string
  descripcion?: string
  tipo_unidad?: TipoUnidad
  numero_unidad?: string
  piso?: number
  area_m2?: number
  activo?: boolean
}

export interface UnidadQuery extends PaginationParams {
  search?: string
  conjuntoId?: string
  tipo_unidad?: TipoUnidad
  activo?: boolean
  piso?: number
}

export const TIPO_UNIDAD_LABELS: Record<TipoUnidad, string> = {
  apartamento:     'Apartamento',
  casa:            'Casa',
  local_comercial: 'Local comercial',
  oficina:         'Oficina',
  bodega:          'Bodega',
  parqueadero:     'Parqueadero',
  otro:            'Otro',
}