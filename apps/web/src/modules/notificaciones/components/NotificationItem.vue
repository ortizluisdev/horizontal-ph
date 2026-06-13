<template>
  <div
    :class="[
      'group relative flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer',
      !notif.leida ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'hover:bg-gray-50',
    ]"
    @click="handleClick"
  >
    <!-- Dot no leída -->
    <span
      v-if="!notif.leida"
      class="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
    />

    <!-- Icono tipo -->
    <div :class="[
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
      iconoBg,
    ]">
      {{ tipoIcon(notif.tipo) }}
    </div>

    <!-- Contenido -->
    <div class="flex-1 min-w-0 space-y-0.5">
      <div class="flex items-start justify-between gap-2">
        <p :class="['text-sm leading-snug', !notif.leida ? 'font-semibold text-gray-900' : 'font-medium text-gray-700']">
          {{ notif.titulo }}
        </p>
        <span class="text-xs text-gray-400 shrink-0 mt-0.5">{{ formatRelativo(notif.created_at) }}</span>
      </div>
      <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ notif.mensaje }}</p>
      <div class="flex items-center gap-2 pt-0.5">
        <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', prioridadBadgeClass(notif.prioridad)]">
          <span :class="['h-1 w-1 rounded-full', prioridadDotClass(notif.prioridad)]" />
          {{ notif.prioridad }}
        </span>
        <a v-if="notif.accion_url" :href="notif.accion_url"
          class="text-xs text-indigo-600 font-medium hover:underline"
          @click.stop>
          {{ notif.accion_label ?? 'Ver más' }} →
        </a>
      </div>
    </div>

    <!-- Acciones hover -->
    <div class="absolute right-3 top-3 hidden group-hover:flex items-center gap-1">
      <button v-if="!notif.leida" title="Marcar como leída"
        class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        @click.stop="emit('leer', notif.id)">
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <button title="Archivar"
        class="rounded-md p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
        @click.stop="emit('archivar', notif.id)">
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
        </svg>
      </button>
      <button title="Eliminar"
        class="rounded-md p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        @click.stop="emit('eliminar', notif.id)">
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Notificacion } from '../types/notificaciones.types'
import { tipoIcon, prioridadBadgeClass, prioridadDotClass, formatRelativo } from '../composables/useNotificaciones'

const props = defineProps<{ notif: Notificacion }>()
const emit  = defineEmits<{
  (e: 'leer',     id: string): void
  (e: 'archivar', id: string): void
  (e: 'eliminar', id: string): void
  (e: 'click',    notif: Notificacion): void
}>()

const router = useRouter()

const iconoBg = computed(() => {
  const map: Record<string, string> = {
    info:            'bg-blue-50',
    exito:           'bg-green-50',
    advertencia:     'bg-yellow-50',
    error:           'bg-red-50',
    documento_vence: 'bg-orange-50',
    estado_cambiado: 'bg-indigo-50',
    nuevo_documento: 'bg-indigo-50',
    comentario:      'bg-purple-50',
    asamblea:        'bg-teal-50',
    pago:            'bg-emerald-50',
  }
  return map[props.notif.tipo] ?? 'bg-gray-50'
})

function handleClick() {
  emit('click', props.notif)
  if (!props.notif.leida) emit('leer', props.notif.id)
  if (props.notif.accion_url) router.push(props.notif.accion_url)
}
</script>