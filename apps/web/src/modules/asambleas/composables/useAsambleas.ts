import { ref, computed } from 'vue'
import { useAsambleasStore } from '../store/asambleas.store'
import type { TipoAsamblea, EstadoAsamblea, AsambleaCreatePayload, AsambleaUpdatePayload } from '../types/asambleas.types'

export const TIPOS_ASAMBLEA: { value: TipoAsamblea; label: string; icon: string }[] = [
  { value: 'ordinaria',        label: 'Ordinaria',        icon: '📋' },
  { value: 'extraordinaria',   label: 'Extraordinaria',   icon: '⚡' },
  { value: 'de_propietarios',  label: 'De propietarios',  icon: '👥' },
  { value: 'de_consejo',       label: 'De consejo',       icon: '🏛️' },
  { value: 'otra',             label: 'Otra',             icon: '📌' },
]

export const ESTADOS_ASAMBLEA: { value: EstadoAsamblea | ''; label: string }[] = [
  { value: '',            label: 'Todos los estados' },
  { value: 'programada',  label: 'Programada' },
  { value: 'en_curso',    label: 'En curso' },
  { value: 'realizada',   label: 'Realizada' },
  { value: 'cancelada',   label: 'Cancelada' },
  { value: 'pospuesta',   label: 'Pospuesta' },
]

export function estadoBadgeClass(estado: EstadoAsamblea): string {
  const map: Record<EstadoAsamblea, string> = {
    programada: 'bg-blue-100   text-blue-800   ring-blue-200',
    en_curso:   'bg-green-100  text-green-800  ring-green-200',
    realizada:  'bg-gray-100   text-gray-700   ring-gray-200',
    cancelada:  'bg-red-100    text-red-700    ring-red-200',
    pospuesta:  'bg-yellow-100 text-yellow-800 ring-yellow-200',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function estadoDotClass(estado: EstadoAsamblea): string {
  const map: Record<EstadoAsamblea, string> = {
    programada: 'bg-blue-500',
    en_curso:   'bg-green-500',
    realizada:  'bg-gray-400',
    cancelada:  'bg-red-500',
    pospuesta:  'bg-yellow-500',
  }
  return map[estado] ?? 'bg-gray-400'
}

export function tipoLabel(tipo: TipoAsamblea): string {
  return TIPOS_ASAMBLEA.find((t) => t.value === tipo)?.label ?? tipo
}

export function tipoIcon(tipo: TipoAsamblea): string {
  return TIPOS_ASAMBLEA.find((t) => t.value === tipo)?.icon ?? '📋'
}

export function formatDateTime(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateShort(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDatetimeLocal(dt: string): string {
  if (!dt) return ''
  const d = new Date(dt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function diasParaAsamblea(fechaProgramada: string): number {
  const diff = new Date(fechaProgramada).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Composable principal ─────────────────────────────────────────────────────

export function useAsambleas() {
  const store = useAsambleasStore()
  return {
    store, TIPOS_ASAMBLEA, ESTADOS_ASAMBLEA,
    estadoBadgeClass, estadoDotClass, tipoLabel, tipoIcon,
    formatDateTime, formatDateShort, diasParaAsamblea,
  }
}

// ─── Composable formulario ────────────────────────────────────────────────────

export function useAsambleaForm(modo: 'crear' | 'editar' = 'crear') {
  const store = useAsambleasStore()

  const form = ref<AsambleaCreatePayload>({
    conjuntoId:       '',
    numero_acta:      '',
    tipo:             'ordinaria',
    asunto:           '',
    fecha_programada: '',
    lugar:            '',
    quorum_requerido: 51,
    notas:            '',
  })

  const errors = ref<Record<string, string>>({})

  function validate(): boolean {
    errors.value = {}
    if (!form.value.conjuntoId)                               errors.value.conjuntoId       = 'El conjunto es obligatorio'
    if (!form.value.numero_acta.trim())                       errors.value.numero_acta      = 'El número de acta es obligatorio'
    if (!form.value.tipo)                                     errors.value.tipo             = 'El tipo es obligatorio'
    if (!form.value.asunto || form.value.asunto.trim().length < 5)
                                                              errors.value.asunto           = 'El asunto debe tener al menos 5 caracteres'
    if (!form.value.fecha_programada)                         errors.value.fecha_programada = 'La fecha es obligatoria'
    else if (modo === 'crear' && new Date(form.value.fecha_programada) < new Date())
                                                              errors.value.fecha_programada = 'La fecha no puede ser en el pasado'
    return Object.keys(errors.value).length === 0
  }

  async function submit(): Promise<{ id: string } | null> {
    if (!validate()) return null
    try {
      const payload = { ...form.value, fecha_programada: new Date(form.value.fecha_programada).toISOString() }
      if (modo === 'crear') return await store.create(payload)
      return null
    } catch { return null }
  }

  async function submitUpdate(id: string): Promise<boolean> {
    if (!validate()) return false
    try {
      const payload: AsambleaUpdatePayload = {
        numero_acta:      form.value.numero_acta,
        tipo:             form.value.tipo,
        asunto:           form.value.asunto,
        fecha_programada: new Date(form.value.fecha_programada).toISOString(),
        lugar:            form.value.lugar,
        quorum_requerido: form.value.quorum_requerido,
        notas:            form.value.notas,
      }
      await store.update(id, payload)
      return true
    } catch { return false }
  }

  function loadFromAsamblea(a: AsambleaCreatePayload & { fecha_programada: string }) {
    form.value = {
      conjuntoId:       a.conjuntoId,
      numero_acta:      a.numero_acta,
      tipo:             a.tipo,
      asunto:           a.asunto,
      fecha_programada: formatDatetimeLocal(a.fecha_programada),
      lugar:            a.lugar ?? '',
      quorum_requerido: a.quorum_requerido ?? 51,
      notas:            a.notas ?? '',
    }
  }

  function reset() {
    form.value = { conjuntoId: '', numero_acta: '', tipo: 'ordinaria', asunto: '', fecha_programada: '', lugar: '', quorum_requerido: 51, notas: '' }
    errors.value = {}
    store.clearError()
  }

  return {
    form, errors,
    saving:      computed(() => store.saving),
    serverError: computed(() => store.error),
    submit, submitUpdate, loadFromAsamblea, reset, validate,
  }
}

// ─── Composable cambio de estado ──────────────────────────────────────────────

export function useAsambleaEstado() {
  const store      = useAsambleasStore()
  const processing = ref(false)
  const error      = ref<string | null>(null)

  async function cambiarEstado(id: string, estado: EstadoAsamblea): Promise<boolean> {
    processing.value = true
    error.value      = null
    try {
      await store.update(id, { estado })
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cambiar estado'
      return false
    } finally {
      processing.value = false
    }
  }

  const iniciar    = (id: string) => cambiarEstado(id, 'en_curso')
  const finalizar  = (id: string) => cambiarEstado(id, 'realizada')
  const cancelar   = (id: string) => cambiarEstado(id, 'cancelada')
  const posponer   = (id: string) => cambiarEstado(id, 'pospuesta')

  return { processing, error, cambiarEstado, iniciar, finalizar, cancelar, posponer }
}