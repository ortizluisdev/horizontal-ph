<template>
  <div class="max-w-2xl mx-auto space-y-5">
    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="!notif" class="text-center py-20 text-gray-400">
      <p class="text-sm">Notificación no encontrada</p>
    </div>

    <template v-else>
      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <!-- Header -->
        <div class="flex items-start gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl', iconoBg]">
            {{ tipoIcon(notif.tipo) }}
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-lg font-bold text-gray-900">{{ notif.titulo }}</h1>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', prioridadBadgeClass(notif.prioridad)]">
                <span :class="['h-1.5 w-1.5 rounded-full', prioridadDotClass(notif.prioridad)]" />
                {{ notif.prioridad }}
              </span>
              <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                {{ tipoLabel(notif.tipo) }}
              </span>
              <span v-if="!notif.leida" class="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs text-indigo-700 font-medium">
                Sin leer
              </span>
            </div>
          </div>
        </div>

        <!-- Cuerpo -->
        <div class="px-6 py-5 space-y-4">
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ notif.mensaje }}</p>

          <a v-if="notif.accion_url" :href="notif.accion_url"
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            {{ notif.accion_label ?? 'Ver más' }}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Metadata -->
        <div class="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div class="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-500">
            <span>📅 Recibida: <strong class="text-gray-700">{{ formatDate(notif.created_at) }}</strong></span>
            <span v-if="notif.leida_at">✅ Leída: <strong class="text-gray-700">{{ formatDate(notif.leida_at) }}</strong></span>
            <span v-if="notif.entidad_tipo">🏷️ Entidad: <strong class="text-gray-700">{{ notif.entidad_tipo }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3">
        <button v-if="!notif.leida"
          class="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          @click="handleLeer">
          ✓ Marcar como leída
        </button>
        <button
          class="flex-1 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
          @click="handleArchivar">
          📁 Archivar
        </button>
        <button
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          @click="handleEliminar">
          🗑 Eliminar
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificacionesStore } from '../store/notificaciones.store'
import { tipoIcon, tipoLabel, prioridadBadgeClass, prioridadDotClass, formatDate } from '../composables/useNotificaciones'

const route  = useRoute()
const router = useRouter()
const store  = useNotificacionesStore()

const notif = computed(() => store.items.find(n => n.id === route.params.id) ?? null)

const iconoBg = computed(() => {
  if (!notif.value) return 'bg-gray-50'
  const map: Record<string, string> = {
    info: 'bg-blue-50', exito: 'bg-green-50', advertencia: 'bg-yellow-50',
    error: 'bg-red-50', documento_vence: 'bg-orange-50', estado_cambiado: 'bg-indigo-50',
    nuevo_documento: 'bg-indigo-50', comentario: 'bg-purple-50', asamblea: 'bg-teal-50', pago: 'bg-emerald-50',
  }
  return map[notif.value.tipo] ?? 'bg-gray-50'
})

onMounted(() => {
  if (!store.items.length) store.fetchList()
  if (notif.value && !notif.value.leida) store.marcarLeida(notif.value.id)
})

async function handleLeer()    { if (notif.value) await store.marcarLeida(notif.value.id) }
async function handleArchivar() {
  if (notif.value) { await store.archivar(notif.value.id); router.push('/notificaciones') }
}
async function handleEliminar() {
  if (notif.value && confirm('¿Eliminar esta notificación?')) {
    await store.eliminar(notif.value.id); router.push('/notificaciones')
  }
}
</script>