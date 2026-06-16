import { ref, computed } from 'vue'
import { useCobranzaStore } from '../store/cobranza.store'
import type {
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  RegistrarPagoPayload,
  EstadoCobranza,
  MetodoPago,
} from '../types/cobranza.types'

// ─── Catálogos ────────────────────────────────────────────────────────────────

export const ESTADOS_COBRANZA: { value: EstadoCobranza | ''; label: string; color: string }[] = [
  { value: '',          label: 'Todos',     color: 'gray'   },
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'pagada',    label: 'Pagada',    color: 'green'  },
  { value: 'vencida',   label: 'Vencida',   color: 'red'    },
  { value: 'en_mora',   label: 'En mora',   color: 'orange' },
  { value: 'anulada',   label: 'Anulada',   color: 'gray'   },
]

export const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo',       label: 'Efectivo'       },
  { value: 'transferencia',  label: 'Transferencia'  },
  { value: 'tarjeta',        label: 'Tarjeta'        },
  { value: 'cheque',         label: 'Cheque'         },
  { value: 'otro',           label: 'Otro'           },
]

export const CONCEPTOS_COBRANZA = [
  'Cuota de administración',
  'Cuota extraordinaria',
  'Mantenimiento áreas comunes',
  'Servicios públicos comunes',
  'Parqueadero',
  'Multa',
  'Intereses de mora',
  'Seguros',
  'Fondo de reserva',
  'Otro',
]

export const MESES = [
  { value: 1,  label: 'Enero'      }, { value: 2,  label: 'Febrero'    },
  { value: 3,  label: 'Marzo'      }, { value: 4,  label: 'Abril'      },
  { value: 5,  label: 'Mayo'       }, { value: 6,  label: 'Junio'      },
  { value: 7,  label: 'Julio'      }, { value: 8,  label: 'Agosto'     },
  { value: 9,  label: 'Septiembre' }, { value: 10, label: 'Octubre'    },
  { value: 11, label: 'Noviembre'  }, { value: 12, label: 'Diciembre'  },
]

// ─── Helpers visuales ─────────────────────────────────────────────────────────

export function estadoBadgeClass(estado: EstadoCobranza): string {
  const map: Record<EstadoCobranza, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    pagada:    'bg-green-100  text-green-800  ring-green-200',
    vencida:   'bg-red-100    text-red-800    ring-red-200',
    en_mora:   'bg-orange-100 text-orange-800 ring-orange-200',
    anulada:   'bg-gray-100   text-gray-500   ring-gray-200',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-500 ring-gray-200'
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '$ 0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function isVencida(fechaVencimiento: string): boolean {
  return new Date(fechaVencimiento + 'T00:00:00') < new Date()
}

export function diasVencida(fechaVencimiento: string): number {
  const diff = Date.now() - new Date(fechaVencimiento + 'T00:00:00').getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// ─── Composable principal ─────────────────────────────────────────────────────

export function useCobranza() {
  const store = useCobranzaStore()
  return {
    store,
    ESTADOS_COBRANZA, METODOS_PAGO, CONCEPTOS_COBRANZA, MESES,
    estadoBadgeClass, formatCurrency, formatDate, isVencida, diasVencida,
  }
}

// ─── Formulario crear / editar ────────────────────────────────────────────────

export function useCobranzaForm(
  opts: {
    modo?:       'crear' | 'editar'
    conjuntoId?: string
    unidadId?:   string
  } = {}
) {
  const { modo = 'crear', conjuntoId = '', unidadId = '' } = opts
  const store = useCobranzaStore()

  const form = ref<CobranzaCreatePayload>({
    unidadId,
    conjuntoId,
    numero_recibo:     '',
    concepto:          '',
    descripcion:       '',
    valor_base:        undefined,
    valor_impuesto:    undefined,
    valor_total:       0,
    mes_facturacion:   new Date().getMonth() + 1,
    anio_facturacion:  new Date().getFullYear(),
    fecha_emision:     new Date().toISOString().slice(0, 10),
    fecha_vencimiento: '',
    observaciones:     '',
  })

  const errors = ref<Partial<Record<keyof CobranzaCreatePayload, string>>>({})

  function validate(): boolean {
    errors.value = {}
    if (!form.value.unidadId)             errors.value.unidadId          = 'La unidad es obligatoria'
    if (!form.value.conjuntoId)           errors.value.conjuntoId        = 'El conjunto es obligatorio'
    if (!form.value.numero_recibo.trim()) errors.value.numero_recibo     = 'El número de recibo es obligatorio'
    if (!form.value.concepto.trim())      errors.value.concepto          = 'El concepto es obligatorio'
    if (!form.value.valor_total || form.value.valor_total <= 0)
                                          errors.value.valor_total       = 'El valor debe ser mayor a cero'
    if (!form.value.fecha_vencimiento)    errors.value.fecha_vencimiento = 'La fecha de vencimiento es obligatoria'
    return Object.keys(errors.value).length === 0
  }

  async function submit(): Promise<string | null> {
    if (!validate()) return null
    try {
      const nueva = await store.create(form.value)
      return nueva.id
    } catch {
      return null
    }
  }

  function reset() {
    form.value = {
      unidadId: conjuntoId ? form.value.unidadId : '',
      conjuntoId,
      numero_recibo:     '',
      concepto:          '',
      descripcion:       '',
      valor_base:        undefined,
      valor_impuesto:    undefined,
      valor_total:       0,
      mes_facturacion:   new Date().getMonth() + 1,
      anio_facturacion:  new Date().getFullYear(),
      fecha_emision:     new Date().toISOString().slice(0, 10),
      fecha_vencimiento: '',
      observaciones:     '',
    }
    errors.value = {}
    store.clearError()
  }

  const saving      = computed(() => store.saving)
  const serverError = computed(() => store.error)

  return { form, errors, saving, serverError, submit, reset, validate }
}

// ─── Formulario de pago ───────────────────────────────────────────────────────

export function useRegistrarPago() {
  const store = useCobranzaStore()

  const form = ref<RegistrarPagoPayload>({
    valor_pagado:    0,
    metodo_pago:     'efectivo',
    referencia_pago: '',
    observaciones:   '',
    fecha_pago:      new Date().toISOString().slice(0, 10),
  })

  const errors = ref<Partial<Record<keyof RegistrarPagoPayload, string>>>({})

  function validate(): boolean {
    errors.value = {}
    if (!form.value.valor_pagado || form.value.valor_pagado <= 0)
      errors.value.valor_pagado = 'El valor pagado debe ser mayor a cero'
    return Object.keys(errors.value).length === 0
  }

  async function submit(id: string): Promise<boolean> {
    if (!validate()) return false
    try {
      await store.registrarPago(id, form.value)
      return true
    } catch {
      return false
    }
  }

  function reset() {
    form.value = {
      valor_pagado:    0,
      metodo_pago:     'efectivo',
      referencia_pago: '',
      observaciones:   '',
      fecha_pago:      new Date().toISOString().slice(0, 10),
    }
    errors.value = {}
    store.clearError()
  }

  const saving      = computed(() => store.saving)
  const serverError = computed(() => store.error)

  return { form, errors, saving, serverError, submit, reset, validate }
}

// ─── Acciones rápidas de estado ───────────────────────────────────────────────

export function useCobranzaEstado() {
  const store      = useCobranzaStore()
  const processing = ref(false)
  const error      = ref<string | null>(null)

  async function cambiarEstado(id: string, payload: CobranzaUpdatePayload): Promise<boolean> {
    processing.value = true
    error.value      = null
    try {
      await store.update(id, payload)
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar estado'
      return false
    } finally {
      processing.value = false
    }
  }

  const anular = (id: string) => cambiarEstado(id, { estado: 'anulada' })

  return { processing, error, cambiarEstado, anular }
}