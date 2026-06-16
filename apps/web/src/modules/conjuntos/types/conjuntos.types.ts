import type { PaginationParams } from '@/shared/types'

export type TipoConjunto = 'edificio' | 'casa' | 'ciudadela' | 'condominio' | 'otro'

export const TIPO_CONJUNTO_LABELS: Record<TipoConjunto, string> = {
  edificio:   'Edificio',
  casa:       'Casa / Unificado',
  ciudadela:  'Ciudadela',
  condominio: 'Condominio',
  otro:       'Otro',
}

export const TIPO_CONJUNTO_OPTIONS = Object.entries(TIPO_CONJUNTO_LABELS).map(
  ([value, label]) => ({ value: value as TipoConjunto, label })
)

export interface Conjunto {
  id: string
  tenant_id: string
  nombre: string
  direccion: string
  ciudad?: string | null
  departamento?: string | null
  pais?: string | null
  codigo_catastral?: string | null
  tipo_conjunto: TipoConjunto
  numero_torres?: number | null
  numero_unidades?: number | null
  anio_construccion?: number | null
  area_total_m2?: number | null
  area_comun_m2?: number | null
  administrador_nombre?: string | null
  administrador_email?: string | null
  administrador_telefono?: string | null
  telefono_emergencia?: string | null
  email_contacto?: string | null
  logo_url?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ConjuntoCreateInput {
  tenantId: string
  nombre: string
  direccion: string
  ciudad?: string
  departamento?: string
  pais?: string
  codigo_catastral?: string
  tipo_conjunto: TipoConjunto
  numero_torres?: number
  numero_unidades?: number
  anio_construccion?: number
  area_total_m2?: number
  area_comun_m2?: number
  administrador_nombre?: string
  administrador_email?: string
  administrador_telefono?: string
  telefono_emergencia?: string
  email_contacto?: string
  logo_url?: string
}

export interface ConjuntoUpdateInput {
  nombre?: string
  direccion?: string
  ciudad?: string
  departamento?: string
  pais?: string
  codigo_catastral?: string
  tipo_conjunto?: TipoConjunto
  numero_torres?: number
  numero_unidades?: number
  anio_construccion?: number
  area_total_m2?: number
  area_comun_m2?: number
  administrador_nombre?: string
  administrador_email?: string
  administrador_telefono?: string
  telefono_emergencia?: string
  email_contacto?: string
  logo_url?: string
  activo?: boolean
}

export interface ConjuntoQuery extends PaginationParams {
  tipo_conjunto?: TipoConjunto
  activo?: boolean
}