import type { PaginationParams } from '@/shared/types'

export type TipoUnidad = 'apartamento' | 'casa' | 'local' | 'parqueadero' | 'bodega' | 'otro'
export type EstadoUnidad = 'ocupado' | 'desocupado' | 'en_mora' | 'bloqueado'

export interface Unidad {
  id: string
  tenant_id: string
  conjunto_id: string
  nombre: string
  tipo: TipoUnidad
  estado: EstadoUnidad
  piso?: number
  area_m2?: number
  coeficiente?: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface UnidadCreateInput {
  conjunto_id: string
  nombre: string
  tipo: TipoUnidad
  estado?: EstadoUnidad
  piso?: number
  area_m2?: number
  coeficiente?: number
}

export interface UnidadUpdateInput {
  nombre?: string
  tipo?: TipoUnidad
  estado?: EstadoUnidad
  piso?: number
  area_m2?: number
  coeficiente?: number
  activo?: boolean
}

export interface UnidadQuery extends PaginationParams {
  conjunto_id?: string
  tipo?: TipoUnidad
  estado?: EstadoUnidad
  activo?: boolean
}