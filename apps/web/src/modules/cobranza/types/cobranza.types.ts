import type { PaginationParams } from '@/shared/types'

export type EstadoCobranza = 'pendiente' | 'pagado' | 'vencido' | 'anulado'
export type TipoCobranza = 'cuota_administracion' | 'multa' | 'parqueadero' | 'otro'

export interface Cobranza {
  id: string
  tenant_id: string
  unidad_id: string
  concepto: string
  tipo: TipoCobranza
  monto: number
  estado: EstadoCobranza
  fecha_emision: string
  fecha_vencimiento: string
  fecha_pago?: string
  observaciones?: string
  created_at: string
  updated_at: string
}

export interface CobranzaCreateInput {
  unidad_id: string
  concepto: string
  tipo: TipoCobranza
  monto: number
  fecha_emision: string
  fecha_vencimiento: string
  observaciones?: string
}

export interface CobranzaUpdateInput {
  concepto?: string
  tipo?: TipoCobranza
  monto?: number
  estado?: EstadoCobranza
  fecha_vencimiento?: string
  fecha_pago?: string
  observaciones?: string
}

export interface CobranzaQuery extends PaginationParams {
  unidad_id?: string
  estado?: EstadoCobranza
  tipo?: TipoCobranza
  fecha_desde?: string
  fecha_hasta?: string
}