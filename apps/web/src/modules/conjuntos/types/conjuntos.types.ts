import type { PaginationParams } from '@/shared/types'

export type TipoConjunto = 'residencial' | 'comercial' | 'mixto' | 'industrial' | 'otro'

export interface Conjunto {
  id: string
  tenant_id: string
  nombre: string
  direccion: string
  ciudad?: string
  tipo_conjunto?: TipoConjunto
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ConjuntoCreateInput {
  tenantId: string
  nombre: string
  direccion: string
  ciudad?: string
  tipo_conjunto?: TipoConjunto
}

export interface ConjuntoUpdateInput {
  nombre?: string
  direccion?: string
  ciudad?: string
  tipo_conjunto?: TipoConjunto
  activo?: boolean
}

export interface ConjuntoQuery extends PaginationParams {
  tipo_conjunto?: TipoConjunto
  activo?: boolean
}