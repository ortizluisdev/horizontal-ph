<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Notificaciones</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ store.noLeidas > 0 ? `${store.noLeidas} sin leer` : 'Todo al día' }}
          · {{ store.total }} en total
        </p>
      </div>
      <button v-if="store.hayNoLeidas" :disabled="store.saving"
        class="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        @click="store.marcarTodasLeidas()">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Marcar todas leídas
      </button>
    </div>

    <!-- Urgentes -->
    <div v-if="store.urgentes.length" class="rounded-xl border border-red-200 bg-red-50 p-4">
      <div class="flex items-start gap-3">
        <span class="text-xl shrink-0">🚨</span>
        <div>
          <p class="text-sm font-semibold text-red-800">Notificaciones urgentes sin leer</p>
          <ul class="mt-1 space-y-0.5">
            <li v-for="n in store.urgentes" :key="n.id"
              class="text-xs text-red-700 cursor-pointer hover:underline"
              @click="handleClick(n)">
              {{ n.titulo }} — {{ formatRelativo(n.created_at) }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p class="text-2xl font-bold text-indigo-700">{{ store.noLeidas }}</p>
        <p class="text-xs font-medium text-indigo-600 mt-0.5">Sin leer</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p class="text-2xl font-bold text-gray-700">{{ store.total }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Total</p>
      </div>
      <div class="rounded-xl border border-red-200 bg-red-50 p-4">
        <p class="text-2xl font-bold text-red-700">{{ store.urgentes.length }}</p>
        <p class="text-xs font-medium text-red-500 mt-0.5">Urgentes</p>
      </div>
      <div class="rounded-xl border border-green-200 bg-green-50 p-4">
        <p class="text-2xl font-bold text-green-700">{{ store.total - store.noLeidas }}</p>
        <p class="text-xs font-medium text-green-600 mt-0.5">Leídas</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select v-model="filtros.leida"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
            <option value="">Todas</option>
            <option :value="false">Sin leer</option>
            <option :value="true">Leídas</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select v-model="filtros.tipo"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
            <option v-for="t in TIPOS_NOTIFICACION" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
          <select v-model="filtros.prioridad"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
            <option v-for="p in PRIORIDADES" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            @click="aplicar">Aplicar</button>
          <button class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="resetFiltros">✕</button>
        </div>
      </div>
    </div>

    <!-- Lista principal -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <NotificationList
        :items="store.items"
        :loading="store.loading"
        @leer="store.marcarLeida($event)"
        @archivar="store.archivar($event)"
        @eliminar="store.eliminar($event)"
        @click="handleClick($event)"
      />

      <!-- Paginación -->
      <div v-if="store.pages > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <p class="text-xs text-gray-500">
          Página {{ store.page }} de {{ store.pages }} · {{ store.total }} notificaciones
        </p>
        <div class="flex gap-1">
          <button :disabled="store.page === 1"
            class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            @click="store.changePage(store.page - 1)">Anterior</button>
          <button :disabled="store.page === store.pages"
            class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            @click="store.changePage(store.page + 1)">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificacionesStore } from '../store/notificaciones.store'
import { TIPOS_NOTIFICACION, PRIORIDADES, formatRelativo } from '../composables/useNotificaciones'
import NotificationList from '../components/NotificationList.vue'
import type { NotificacionFilters, Notificacion } from '../types/notificaciones.types'

const router = useRouter()
const store  = useNotificacionesStore()

const filtros = reactive<NotificacionFilters>({
  leida: '', tipo: '', prioridad: '', archivada: false,
})

onMounted(() => store.fetchList({ archivada: false }))

function aplicar() { store.applyFilters({ ...filtros }) }

function resetFiltros() {
  filtros.leida = ''; filtros.tipo = ''; filtros.prioridad = ''; filtros.archivada = false
  store.applyFilters({ archivada: false })
}

function handleClick(n: Notificacion) {
  if (n.accion_url) router.push(n.accion_url)
  else router.push(`/notificaciones/${n.id}`)
}
</script>