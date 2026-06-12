// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoCobranza = 'pendiente' | 'pagada' | 'vencida' | 'anulada' | 'en_mora'

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro'

// ─── Entidad principal ────────────────────────────────────────────────────────

export interface Cobranza {
  id: string
  unidad_id: string
  conjunto_id: string
  numero_recibo: string
  concepto: string
  descripcion?: string
  valor_base?: number
  valor_impuesto?: number
  valor_total: number
  valor_pagado?: number
  valor_deuda?: number
  mes_facturacion?: number
  anio_facturacion?: number
  fecha_emision?: string
  fecha_vencimiento: string
  fecha_pago?: string | null
  metodo_pago?: MetodoPago | null
  estado: EstadoCobranza
  referencia_pago?: string | null
  observaciones?: string | null
  activo?: boolean
  created_at: string
  updated_at: string
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedCobranzas {
  data: Cobranza[]
  total: number
  page: number
  limit: number
  pages: number
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CobranzaCreatePayload {
  unidadId: string
  conjuntoId: string
  numero_recibo: string
  concepto: string
  valor_total: number
  fecha_vencimiento: string // YYYY-MM-DD
}

export interface CobranzaUpdatePayload {
  concepto?: string
  valor_total?: number
  fecha_vencimiento?: string
  estado?: EstadoCobranza
}

// ─── Query filters ────────────────────────────────────────────────────────────

export interface CobranzaFilters {
  page?: number
  limit?: number
  conjuntoId?: string
  unidadId?: string
  estado?: EstadoCobranza | ''
  fechaDesde?: string
  fechaHasta?: string
}

// ─── Resumen de deuda ─────────────────────────────────────────────────────────

export interface ResumenDeuda {
  total_pendiente: number
  total_vencido: number
  total_mora: number
  total_pagado_mes: number
  cantidad_pendientes: number
  cantidad_vencidas: number
}