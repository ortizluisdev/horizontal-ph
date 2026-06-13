import { computed } from 'vue'
import { useNotificacionesStore } from '../store/notificaciones.store'
import type { TipoNotificacion, PrioridadNotificacion } from '../types/notificaciones.types'

export const TIPOS_NOTIFICACION: { value: TipoNotificacion | ''; label: string; icon: string }[] = [
  { value: '',                label: 'Todos los tipos',   icon: '🔔' },
  { value: 'info',            label: 'Información',       icon: 'ℹ️' },
  { value: 'exito',           label: 'Éxito',             icon: '✅' },
  { value: 'advertencia',     label: 'Advertencia',       icon: '⚠️' },
  { value: 'error',           label: 'Error',             icon: '❌' },
  { value: 'documento_vence', label: 'Documento vence',   icon: '📅' },
  { value: 'estado_cambiado', label: 'Cambio de estado',  icon: '🔄' },
  { value: 'nuevo_documento', label: 'Nuevo documento',   icon: '📄' },
  { value: 'comentario',      label: 'Comentario',        icon: '💬' },
  { value: 'asamblea',        label: 'Asamblea',          icon: '🏛️' },
  { value: 'pago',            label: 'Pago',              icon: '💳' },
]

export const PRIORIDADES: { value: PrioridadNotificacion | ''; label: string }[] = [
  { value: '',        label: 'Todas las prioridades' },
  { value: 'baja',    label: 'Baja'    },
  { value: 'media',   label: 'Media'   },
  { value: 'alta',    label: 'Alta'    },
  { value: 'urgente', label: 'Urgente' },
]

export function tipoIcon(tipo: TipoNotificacion): string {
  return TIPOS_NOTIFICACION.find(t => t.value === tipo)?.icon ?? '🔔'
}

export function tipoLabel(tipo: TipoNotificacion): string {
  return TIPOS_NOTIFICACION.find(t => t.value === tipo)?.label ?? tipo
}

export function prioridadBadgeClass(prioridad: PrioridadNotificacion): string {
  const map: Record<PrioridadNotificacion, string> = {
    baja:    'bg-gray-100   text-gray-600   ring-gray-200',
    media:   'bg-blue-100   text-blue-700   ring-blue-200',
    alta:    'bg-yellow-100 text-yellow-800 ring-yellow-200',
    urgente: 'bg-red-100    text-red-700    ring-red-200',
  }
  return map[prioridad] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function prioridadDotClass(prioridad: PrioridadNotificacion): string {
  const map: Record<PrioridadNotificacion, string> = {
    baja:    'bg-gray-400',
    media:   'bg-blue-500',
    alta:    'bg-yellow-500',
    urgente: 'bg-red-500',
  }
  return map[prioridad] ?? 'bg-gray-400'
}

export function formatDate(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDateShort(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelativo(dt: string): string {
  if (!dt) return '-'
  const diff = Date.now() - new Date(dt).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)
  if (min  <  1)  return 'Ahora mismo'
  if (min  < 60)  return `Hace ${min} min`
  if (hrs  < 24)  return `Hace ${hrs} h`
  if (dias <  7)  return `Hace ${dias} día(s)`
  return formatDateShort(dt)
}

export function useNotificaciones() {
  const store = useNotificacionesStore()
  return {
    store,
    TIPOS_NOTIFICACION, PRIORIDADES,
    tipoIcon, tipoLabel, prioridadBadgeClass, prioridadDotClass,
    formatDate, formatDateShort, formatRelativo,
    noLeidas:      computed(() => store.noLeidas),
    hayNoLeidas:   computed(() => store.hayNoLeidas),
    contadorBadge: computed(() => store.contadorBadge),
  }
}