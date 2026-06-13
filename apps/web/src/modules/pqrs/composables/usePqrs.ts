import { ref, computed } from 'vue'
import { usePqrsStore } from '../store/pqrs.store'
import type {
  Pqrs,
  TipoPqrs, EstadoPqrs, PrioridadPqrs, CategoriaPqrs,
  PqrsCreatePayload, PqrsUpdatePayload,
} from '../types/pqrs.types'

// ─── Catálogos ────────────────────────────────────────────────────────────────

export const TIPOS_PQRS: { value: TipoPqrs; label: string; icon: string }[] = [
  { value: 'peticion',   label: 'Petición',   icon: '📋' },
  { value: 'queja',      label: 'Queja',      icon: '😤' },
  { value: 'reclamo',    label: 'Reclamo',    icon: '⚠️' },
  { value: 'sugerencia', label: 'Sugerencia', icon: '💡' },
]

export const ESTADOS_PQRS: { value: EstadoPqrs | ''; label: string }[] = [
  { value: '',           label: 'Todos los estados' },
  { value: 'abierta',    label: 'Abierta' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelta',   label: 'Resuelta' },
  { value: 'cerrada',    label: 'Cerrada' },
  { value: 'archivada',  label: 'Archivada' },
]

export const PRIORIDADES_PQRS: { value: PrioridadPqrs | ''; label: string }[] = [
  { value: '',        label: 'Todas' },
  { value: 'baja',    label: 'Baja' },
  { value: 'normal',  label: 'Normal' },
  { value: 'alta',    label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

export const CATEGORIAS_PQRS: { value: CategoriaPqrs | ''; label: string }[] = [
  { value: '',                label: 'Todas las categorías' },
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'servicios',       label: 'Servicios' },
  { value: 'seguridad',       label: 'Seguridad' },
  { value: 'convivencia',     label: 'Convivencia' },
  { value: 'otro',            label: 'Otro' },
]

// ─── Badge classes ────────────────────────────────────────────────────────────

export function estadoBadgeClass(estado: EstadoPqrs): string {
  const map: Record<EstadoPqrs, string> = {
    abierta:    'bg-blue-100   text-blue-800   ring-blue-200',
    en_proceso: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    resuelta:   'bg-green-100  text-green-800  ring-green-200',
    cerrada:    'bg-gray-100   text-gray-600   ring-gray-200',
    archivada:  'bg-gray-50    text-gray-400   ring-gray-100',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function prioridadBadgeClass(prioridad: PrioridadPqrs): string {
  const map: Record<PrioridadPqrs, string> = {
    baja:    'bg-gray-100   text-gray-500',
    normal:  'bg-blue-50    text-blue-600',
    alta:    'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100    text-red-700 font-semibold',
  }
  return map[prioridad] ?? 'bg-gray-100 text-gray-500'
}

export function tipoLabel(tipo: TipoPqrs): string {
  return TIPOS_PQRS.find((t) => t.value === tipo)?.label ?? tipo
}

export function tipoIcon(tipo: TipoPqrs): string {
  return TIPOS_PQRS.find((t) => t.value === tipo)?.icon ?? '📄'
}

export function formatDateTime(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDate(d: string): string {
  if (!d) return '-'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

// ─── Composable principal ─────────────────────────────────────────────────────

export function usePqrs() {
  const store = usePqrsStore()
  return { store, TIPOS_PQRS, ESTADOS_PQRS, PRIORIDADES_PQRS, CATEGORIAS_PQRS,
    estadoBadgeClass, prioridadBadgeClass, tipoLabel, tipoIcon, formatDateTime, formatDate }
}

// ─── Composable formulario ────────────────────────────────────────────────────

export function usePqrsForm() {
  const store = usePqrsStore()

  const form = ref<PqrsCreatePayload>({
    conjuntoId:         '',
    unidadId:           '',
    tipo:               'peticion',
    asunto:             '',
    descripcion:        '',
    categoria:          undefined,
    prioridad:          'normal',
    nombre_solicitante: '',
    email_solicitante:  '',
    ubicacion_afectada: '',
    requiere_seguimiento: false,
  })

  const errors = ref<Record<string, string>>({})

  function validate(): boolean {
    errors.value = {}
    if (!form.value.conjuntoId)                         errors.value.conjuntoId   = 'El conjunto es obligatorio'
    if (!form.value.unidadId)                           errors.value.unidadId     = 'La unidad es obligatoria'
    if (!form.value.tipo)                               errors.value.tipo         = 'El tipo es obligatorio'
    if (!form.value.asunto || form.value.asunto.trim().length < 5)
                                                        errors.value.asunto       = 'El asunto debe tener al menos 5 caracteres'
    if (!form.value.descripcion || form.value.descripcion.trim().length < 10)
                                                        errors.value.descripcion  = 'La descripción debe tener al menos 10 caracteres'
    return Object.keys(errors.value).length === 0
  }

  async function submit(): Promise<Pqrs | null> {
    if (!validate()) return null
    try {
      return await store.create(form.value)
    } catch { return null }
  }

  function reset() {
    form.value = {
      conjuntoId: '', unidadId: '', tipo: 'peticion',
      asunto: '', descripcion: '', prioridad: 'normal',
      nombre_solicitante: '', email_solicitante: '',
      ubicacion_afectada: '', requiere_seguimiento: false,
    }
    errors.value = {}
    store.clearError()
  }

  return {
    form, errors,
    saving:      computed(() => store.saving),
    serverError: computed(() => store.error),
    submit, reset, validate,
  }
}

// ─── Composable gestión de estado (admin) ─────────────────────────────────────

export function usePqrsGestion() {
  const store      = usePqrsStore()
  const processing = ref(false)
  const error      = ref<string | null>(null)

  async function cambiarEstado(id: string, payload: PqrsUpdatePayload): Promise<boolean> {
    processing.value = true
    error.value      = null
    try {
      await store.update(id, payload)
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al gestionar PQRS'
      return false
    } finally {
      processing.value = false
    }
  }

  const tomarCaso    = (id: string, nombre: string) =>
    cambiarEstado(id, { estado: 'en_proceso', responsable_asignado_nombre: nombre })
  const resolver     = (id: string, respuesta: string) =>
    cambiarEstado(id, { estado: 'resuelta', respuesta_descripcion: respuesta })
  const cerrar       = (id: string) => cambiarEstado(id, { estado: 'cerrada' })
  const archivar     = (id: string) => cambiarEstado(id, { estado: 'archivada' })

  return { processing, error, cambiarEstado, tomarCaso, resolver, cerrar, archivar }
}