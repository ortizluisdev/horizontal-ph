import type { PaginationParams } from '@/shared/types'

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoCobranza = 'pendiente' | 'pagado' | 'parcial' | 'vencido' | 'cancelado'

export type EstadoCobranzaFilter = EstadoCobranza | ''

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro'

export const ESTADOS_COBRANZA_OPTIONS: {
  value: EstadoCobranzaFilter
  label: string
  color: string
}[] = [
  { value: '',          label: 'Todos',     color: 'gray'   },
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'pagado',    label: 'Pagado',    color: 'green'  },
  { value: 'parcial',   label: 'Parcial',   color: 'blue'   },
  { value: 'vencido',   label: 'Vencido',   color: 'red'    },
  { value: 'cancelado', label: 'Cancelado', color: 'gray'   },
]

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  tarjeta:       'Tarjeta',
  cheque:        'Cheque',
  otro:          'Otro',
}

export const CONCEPTOS_COBRANZA = [
  'Cuota de administración',
  'Cuota extraordinaria',
  'Mantenimiento áreas comunes',
  'Servicios públicos comunes',
  'Parqueadero',
  'Multa',
  'Otro',
] as const

export const MESES = [
  { value: 1,  label: 'Enero'      },
  { value: 2,  label: 'Febrero'    },
  { value: 3,  label: 'Marzo'      },
  { value: 4,  label: 'Abril'      },
  { value: 5,  label: 'Mayo'       },
  { value: 6,  label: 'Junio'      },
  { value: 7,  label: 'Julio'      },
  { value: 8,  label: 'Agosto'     },
  { value: 9,  label: 'Septiembre' },
  { value: 10, label: 'Octubre'    },
  { value: 11, label: 'Noviembre'  },
  { value: 12, label: 'Diciembre'  },
]

// ─── Entidad principal ────────────────────────────────────────────────────────

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

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CobranzaCreatePayload {
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
  observaciones?: string
}

export interface CobranzaUpdatePayload {
  concepto?: string
  descripcion?: string
  valor_base?: number
  valor_impuesto?: number
  valor_total?: number
  valor_pagado?: number
  fecha_vencimiento?: string
  fecha_pago?: string
  metodo_pago?: MetodoPago
  referencia_pago?: string
  observaciones?: string
  estado?: EstadoCobranza
}

// ─── Query filters ────────────────────────────────────────────────────────────

export interface CobranzaFilters extends PaginationParams {
  conjuntoId?: string
  unidadId?: string
  estado?: EstadoCobranzaFilter
  fechaDesde?: string
  fechaHasta?: string
  search?: string
}