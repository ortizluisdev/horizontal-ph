<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        @click="$router.back()"
        class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-900">Detalle de unidad</h1>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm text-gray-400">Cargando unidad...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="store.error"
      class="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-5 py-4"
    >
      <span class="text-xl">⚠️</span>
      <div>
        <p class="font-semibold">No se pudo cargar la unidad</p>
        <p class="text-red-500 mt-0.5">{{ store.error }}</p>
      </div>
    </div>

    <!-- Contenido -->
    <template v-else-if="store.current">

      <!-- Card principal -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">

        <!-- Nombre y estado -->
        <div class="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ store.current.nombre }}</h2>
            <p class="text-sm text-gray-500 capitalize mt-0.5">{{ store.current.tipo }}</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <span :class="estadoClass" class="text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              {{ store.current.estado.replace('_', ' ') }}
            </span>
            <span
              :class="store.current.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {{ store.current.activo ? '● Activa' : '● Inactiva' }}
            </span>
          </div>
        </div>

        <!-- Stats visuales -->
        <div class="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
          <div class="text-center">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Piso</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ store.current.piso ?? '—' }}</p>
          </div>
          <div class="text-center border-x border-gray-200">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Área</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">
              {{ store.current.area_m2 ?? '—' }}
              <span v-if="store.current.area_m2" class="text-sm font-normal text-gray-500">m²</span>
            </p>
          </div>
          <div class="text-center">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Coeficiente</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">
              {{ store.current.coeficiente ?? '—' }}
              <span v-if="store.current.coeficiente" class="text-sm font-normal text-gray-500">%</span>
            </p>
          </div>
        </div>

        <!-- Datos técnicos -->
        <div class="pt-4 border-t border-gray-100">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Información técnica</h3>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-xs text-gray-400">ID de unidad</dt>
              <dd class="mt-0.5 text-xs font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all">
                {{ store.current.id }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">ID de conjunto</dt>
              <dd class="mt-0.5 text-xs font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all">
                {{ store.current.conjunto_id }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Fecha de creación</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ formatDate(store.current.created_at) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Última actualización</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ formatDate(store.current.updated_at) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Acciones -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <router-link
          :to="`/unidades/${store.current.id}/editar`"
          class="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          ✏️ Editar unidad
        </router-link>
        <router-link
          :to="`/conjuntos/${store.current.conjunto_id}`"
          class="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          🏢 Ver conjunto
        </router-link>
        <router-link
          :to="`/cobranza?unidad_id=${store.current.id}`"
          class="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          💳 Ver cobranza
        </router-link>
      </div>

      <!-- Danger zone -->
      <div class="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-red-700 mb-1">Zona de peligro</h3>
        <p class="text-xs text-red-500 mb-3">Esta acción eliminará la unidad permanentemente. No se puede deshacer.</p>
        <button
          @click="onEliminar"
          :disabled="eliminando"
          class="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {{ eliminando ? 'Eliminando...' : 'Eliminar unidad' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUnidadesStore } from '../store/unidades.store'
import type { EstadoUnidad } from '../types/unidades.types'

const route    = useRoute()
const router   = useRouter()
const store    = useUnidadesStore()
const eliminando = ref(false)

onMounted(() => store.fetchById(route.params.id as string))

const estadoClass = computed(() => ({
  ocupado:    'bg-green-100 text-green-700',
  desocupado: 'bg-gray-100 text-gray-600',
  en_mora:    'bg-red-100 text-red-700',
  bloqueado:  'bg-yellow-100 text-yellow-700',
}[store.current?.estado as EstadoUnidad] ?? 'bg-gray-100 text-gray-600'))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}

async function onEliminar() {
  if (!confirm('¿Eliminar esta unidad? Esta acción es permanente.')) return
  eliminando.value = true
  try {
    await store.remove(store.current!.id)
    router.push('/unidades')
  } finally {
    eliminando.value = false
  }
}
</script>