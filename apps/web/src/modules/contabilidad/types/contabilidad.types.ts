import type { PaginationParams } from '@/shared/types'

export type TipoMovimiento =
  | 'ingreso' | 'egreso' | 'ajuste' | 'traslado' | 'apertura' | 'cierre'

export type CategoriaMovimiento =
  | 'cuota_administracion' | 'cuota_extraordinaria' | 'mantenimiento'
  | 'servicios_publicos' | 'nomina' | 'seguros' | 'impuestos'
  | 'reparaciones' | 'arrendamiento' | 'intereses' | 'multas' | 'reservas' | 'otro'

export type EstadoMovimiento = 'activo' | 'anulado'

export interface Movimiento {
  id: string
  conjunto_id: string
  numero_asiento: string
  tipo_movimiento: TipoMovimiento
  categoria: CategoriaMovimiento
  valor_debit: number
  valor_credit: number
  descripcion?: string
  fecha_movimiento: string
  referencia_externa?: string
  unidad_id?: string
  cobranza_id?: string
  estado: EstadoMovimiento
  motivo_anulacion?: string
  created_at: string
  updated_at: string
}

export interface MovimientoCreateInput {
  conjuntoId: string
  numero_asiento: string
  tipo_movimiento: TipoMovimiento
  categoria: CategoriaMovimiento
  valor_debit?: number
  valor_credit?: number
  descripcion?: string
  fecha_movimiento: string
  referencia_externa?: string
  unidad_id?: string
  cobranza_id?: string
}

export interface MovimientoUpdateInput {
  descripcion?: string
  referencia_externa?: string
}

export interface MovimientoAnularInput {
  motivo_anulacion: string
}

export interface MovimientoQuery extends PaginationParams {
  conjuntoId?: string
  tipo_movimiento?: TipoMovimiento
  categoria?: CategoriaMovimiento
  estado?: EstadoMovimiento
  fechaDesde?: string
  fechaHasta?: string
  unidad_id?: string
}

export interface BalanceQuery {
  conjuntoId: string
  fechaDesde: string
  fechaHasta: string
}

export interface Balance {
  conjuntoId: string
  fechaDesde: string
  fechaHasta: string
  total_debitos: number
  total_creditos: number
  saldo: number
}

export interface MovimientosPaginados {
  data: Movimiento[]
  total: number
  page: number
  limit: number
  pages: number
  total_debitos: number
  total_creditos: number
}

// Para presupuesto (manejado localmente, sin endpoint dedicado aún)
export interface LineaPresupuesto {
  id: string
  categoria: CategoriaMovimiento
  descripcion: string
  presupuestado: number
  ejecutado: number
  diferencia: number
  porcentaje: number
}