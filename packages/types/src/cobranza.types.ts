// packages/types/src/cobranza.types.ts

export type EstadoCobranza = 'pendiente' | 'pagado' | 'parcial' | 'vencido' | 'cancelado'

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro'

export interface Cobranza {
  id: string
  unidad_id: string
  conjunto_id: string
  numero_recibo: string
  concepto: string
  descripcion?: string | null
  valor_base: number
  valor_impuesto: number
  valor_total: number
  valor_pagado: number
  valor_deuda?: number | null
  mes_facturacion?: number | null
  anio_facturacion?: number | null
  fecha_emision: string
  fecha_vencimiento: string
  fecha_pago?: string | null
  metodo_pago?: MetodoPago | null
  estado: EstadoCobranza
  referencia_pago?: string | null
  observaciones?: string | null
  enviado_cobrador: boolean
  fecha_envio_cobrador?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CobranzaInput {
  unidadId: string
  conjuntoId: string
  numero_recibo: string
  concepto: string
  descripcion?: string
  valor_base: number
  valor_impuesto?: number
  valor_total: number
  mes_facturacion?: number
  anio_facturacion?: number
  fecha_emision?: string
  fecha_vencimiento: string
}