import { ref, computed } from 'vue'
import { useCobranzaStore } from '../store/cobranza.store'
import type { CobranzaCreatePayload, CobranzaUpdatePayload, EstadoCobranza } from '../types/cobranza.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ESTADOS_COBRANZA: { value: EstadoCobranza | ''; label: string; color: string }[] = [
  { value: '',          label: 'Todos',     color: 'gray'   },
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'pagada',    label: 'Pagada',    color: 'green'  },
  { value: 'vencida',   label: 'Vencida',   color: 'red'    },
  { value: 'en_mora',   label: 'En mora',   color: 'orange' },
  { value: 'anulada',   label: 'Anulada',   color: 'gray'   },
]

export function estadoBadgeClass(estado: EstadoCobranza): string {
  const map: Record<EstadoCobranza, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    pagada:    'bg-green-100  text-green-800  ring-green-200',
    vencida:   'bg-red-100    text-red-800    ring-red-200',
    en_mora:   'bg-orange-100 text-orange-800 ring-orange-200',
    anulada:   'bg-gray-100   text-gray-600   ring-gray-200',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function isVencida(fechaVencimiento: string): boolean {
  return new Date(fechaVencimiento) < new Date()
}

// ─── Composable principal ─────────────────────────────────────────────────────

export function useCobranza() {
  const store = useCobranzaStore()
  return { store, ESTADOS_COBRANZA, estadoBadgeClass, formatCurrency, formatDate, isVencida }
}

// ─── Composable para el formulario de creación/edición ────────────────────────

export function useCobranzaForm(modo: 'crear' | 'editar' = 'crear') {
  const store = useCobranzaStore()

  const form = ref<CobranzaCreatePayload>({
    unidadId:          '',
    conjuntoId:        '',
    numero_recibo:     '',
    concepto:          '',
    valor_total:       0,
    fecha_vencimiento: '',
  })

  const errors = ref<Partial<Record<keyof CobranzaCreatePayload, string>>>({})

  function validate(): boolean {
    errors.value = {}
    if (!form.value.unidadId)                          errors.value.unidadId          = 'La unidad es obligatoria'
    if (!form.value.conjuntoId)                        errors.value.conjuntoId        = 'El conjunto es obligatorio'
    if (!form.value.numero_recibo.trim())              errors.value.numero_recibo     = 'El número de recibo es obligatorio'
    if (!form.value.concepto.trim())                   errors.value.concepto          = 'El concepto es obligatorio'
    if (!form.value.valor_total || form.value.valor_total <= 0)
                                                       errors.value.valor_total       = 'El valor debe ser mayor a cero'
    if (!form.value.fecha_vencimiento)                 errors.value.fecha_vencimiento = 'La fecha de vencimiento es obligatoria'
    return Object.keys(errors.value).length === 0
  }

  async function submit(): Promise<boolean> {
    if (!validate()) return false
    try {
      if (modo === 'crear') {
        await store.create(form.value)
      }
      return true
    } catch {
      return false
    }
  }

  function reset() {
    form.value = { unidadId: '', conjuntoId: '', numero_recibo: '', concepto: '', valor_total: 0, fecha_vencimiento: '' }
    errors.value = {}
    store.clearError()
  }

  return { form, errors, saving: computed(() => store.saving), serverError: computed(() => store.error), submit, reset, validate }
}

// ─── Composable para cambiar estado (pagar, anular, etc.) ────────────────────

export function useCobranzaEstado() {
  const store = useCobranzaStore()
  const processing = ref(false)
  const error = ref<string | null>(null)

  async function cambiarEstado(id: string, payload: CobranzaUpdatePayload): Promise<boolean> {
    processing.value = true
    error.value = null
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

  const marcarPagada = (id: string) => cambiarEstado(id, { estado: 'pagada' })
  const anular       = (id: string) => cambiarEstado(id, { estado: 'anulada' })

  return { processing, error, cambiarEstado, marcarPagada, anular }
}