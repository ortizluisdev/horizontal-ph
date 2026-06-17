import { ref, computed, watch } from 'vue'
import { useCobranzaStore } from '../store/cobranza.store'
import type {
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  EstadoCobranza,
  MetodoPago,
} from '../types/cobranza.types'
import {
  ESTADOS_COBRANZA_OPTIONS,
  METODO_PAGO_LABELS,
  CONCEPTOS_COBRANZA,
  MESES,
} from '../types/cobranza.types'

// ─── Re-exportar constantes para que los componentes las importen desde aquí ─

export { ESTADOS_COBRANZA_OPTIONS as ESTADOS_COBRANZA, METODO_PAGO_LABELS, CONCEPTOS_COBRANZA, MESES }

// ─── Helpers de formato ───────────────────────────────────────────────────────

export function estadoBadgeClass(estado: EstadoCobranza): string {
  const map: Record<EstadoCobranza, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    pagado:    'bg-green-100  text-green-800  ring-green-200',
    parcial:   'bg-blue-100   text-blue-800   ring-blue-200',
    vencido:   'bg-red-100    text-red-800    ring-red-200',
    cancelado: 'bg-gray-100   text-gray-600   ring-gray-200',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function formatCurrency(value: number | undefined | null): string {
  return new Intl.NumberFormat('es-CO', {
    style:                 'currency',
    currency:              'COP',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function isVencida(fechaVencimiento: string): boolean {
  return new Date(fechaVencimiento) < new Date()
}

export function labelEstado(estado: EstadoCobranza): string {
  return ESTADOS_COBRANZA_OPTIONS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Composable principal ─────────────────────────────────────────────────────

export function useCobranza() {
  const store = useCobranzaStore()
  return {
    store,
    ESTADOS_COBRANZA: ESTADOS_COBRANZA_OPTIONS,
    estadoBadgeClass,
    formatCurrency,
    formatDate,
    isVencida,
    labelEstado,
  }
}

// ─── Tipos para el formulario ─────────────────────────────────────────────────

export interface CobranzaFormOptions {
  modo?:       'crear' | 'editar'
  conjuntoId?: string
  unidadId?:   string
}

// ─── Composable para formulario — acepta string O objeto ─────────────────────

export function useCobranzaForm(optsOrModo: 'crear' | 'editar' | CobranzaFormOptions = 'crear') {
  const store = useCobranzaStore()

  // Normalizar argumento
  const opts: CobranzaFormOptions =
    typeof optsOrModo === 'string'
      ? { modo: optsOrModo }
      : optsOrModo

  const modo       = opts.modo       ?? 'crear'
  const conjuntoId = opts.conjuntoId ?? ''
  const unidadId   = opts.unidadId   ?? ''

  const form = ref<CobranzaCreatePayload>({
    unidadId,
    conjuntoId,
    numero_recibo:     '',
    concepto:          '',
    descripcion:       '',
    valor_base:        0,
    valor_impuesto:    0,
    valor_total:       0,
    mes_facturacion:   undefined,
    anio_facturacion:  undefined,
    fecha_emision:     new Date().toISOString().slice(0, 10),
    fecha_vencimiento: '',
    observaciones:     '',
  })

  const errors = ref<Partial<Record<keyof CobranzaCreatePayload, string>>>({})

  function validate(): boolean {
    errors.value = {}
    if (!form.value.unidadId)
      errors.value.unidadId = 'La unidad es obligatoria'
    if (!form.value.conjuntoId)
      errors.value.conjuntoId = 'El conjunto es obligatorio'
    if (!form.value.numero_recibo.trim())
      errors.value.numero_recibo = 'El número de recibo es obligatorio'
    if (!form.value.concepto)
      errors.value.concepto = 'El concepto es obligatorio'
    if (!form.value.valor_base || form.value.valor_base <= 0)
      errors.value.valor_base = 'El valor base debe ser mayor a cero'
    if (!form.value.valor_total || form.value.valor_total <= 0)
      errors.value.valor_total = 'El valor total debe ser mayor a cero'
    if (!form.value.fecha_vencimiento)
      errors.value.fecha_vencimiento = 'La fecha de vencimiento es obligatoria'
    return Object.keys(errors.value).length === 0
  }

  // Retorna el id creado o null
  async function submit(): Promise<string | null> {
    if (!validate()) return null
    try {
      if (modo === 'crear') {
        const created = await store.create(form.value)
        return created.id
      }
      return null
    } catch {
      return null
    }
  }

  function reset() {
    form.value = {
      unidadId:          conjuntoId ? '' : form.value.unidadId,
      conjuntoId:        conjuntoId,
      numero_recibo:     '',
      concepto:          '',
      descripcion:       '',
      valor_base:        0,
      valor_impuesto:    0,
      valor_total:       0,
      mes_facturacion:   undefined,
      anio_facturacion:  undefined,
      fecha_emision:     new Date().toISOString().slice(0, 10),
      fecha_vencimiento: '',
      observaciones:     '',
    }
    errors.value = {}
    store.clearError()
  }

  return {
    form,
    errors,
    saving:      computed(() => store.saving),
    serverError: computed(() => store.error),
    submit,
    reset,
    validate,
  }
}

// ─── Composable para cambio de estado ────────────────────────────────────────

export function useCobranzaEstado() {
  const store      = useCobranzaStore()
  const processing = ref(false)
  const error      = ref<string | null>(null)

  async function cambiarEstado(
    id: string,
    payload: CobranzaUpdatePayload
  ): Promise<boolean> {
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

  const marcarPagada = (id: string, metodo?: MetodoPago) =>
    cambiarEstado(id, {
      estado:      'pagado',
      metodo_pago: metodo,
      fecha_pago:  new Date().toISOString().slice(0, 10),
    })

  const anular = (id: string) =>
    cambiarEstado(id, { estado: 'cancelado' })

  return { processing, error, cambiarEstado, marcarPagada, anular }
}