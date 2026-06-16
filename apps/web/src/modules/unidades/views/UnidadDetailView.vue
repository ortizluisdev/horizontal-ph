<template>
  <div class="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        @click="$router.back()"
        class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Detalle de unidad</h1>
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
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      <div>
        <p class="font-semibold">No se pudo cargar la unidad</p>
        <p class="text-red-500 mt-0.5">{{ store.error }}</p>
      </div>
    </div>

    <template v-else-if="store.current">

      <!-- Card principal -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-6">

        <!-- Nombre, tipo y badges -->
        <div class="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">{{ store.current.nombre }}</h2>
            <p v-if="store.current.numero_unidad" class="text-sm text-gray-400 mt-0.5">
              # {{ store.current.numero_unidad }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              {{ store.current.tipo_unidad ? TIPO_UNIDAD_LABELS[store.current.tipo_unidad] : 'Sin tipo definido' }}
            </p>
            <p v-if="store.current.descripcion" class="text-sm text-gray-400 mt-1 max-w-md">
              {{ store.current.descripcion }}
            </p>
          </div>
          <span
            :class="store.current.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            class="text-xs font-semibold px-3 py-1.5 rounded-full"
          >
            {{ store.current.activo ? '● Activa' : '● Inactiva' }}
          </span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
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
          <div class="text-center col-span-2 sm:col-span-1 border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Conjunto</p>
            <p class="text-sm font-semibold text-gray-900 mt-1 truncate px-2">
              {{ store.current.conjunto_nombre ?? '—' }}
            </p>
          </div>
        </div>

        <!-- Información técnica -->
        <div class="pt-4 border-t border-gray-100">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Información técnica</h3>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-gray-400">ID de unidad</dt>
              <dd class="mt-0.5 text-xs font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all select-all">
                {{ store.current.id }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">ID de conjunto</dt>
              <dd class="mt-0.5 text-xs font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all select-all">
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Editar unidad
        </router-link>
        <button
          @click="onDesactivar"
          :disabled="accionando"
          class="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
          {{ store.current.activo ? 'Desactivar' : 'Activar' }}
        </button>
        <router-link
          :to="`/conjuntos/${store.current.conjunto_id}`"
          class="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Ver conjunto
        </router-link>
      </div>

      <!-- Danger zone -->
      <div class="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-red-700 mb-1">Zona de peligro</h3>
        <p class="text-xs text-red-500 mb-3">
          Elimina permanentemente la unidad y todos sus datos asociados. Esta acción no se puede deshacer.
        </p>
        <button
          @click="onEliminar"
          :disabled="accionando"
          class="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {{ accionando ? 'Procesando...' : 'Eliminar unidad' }}
        </button>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUnidadesStore } from '../store/unidades.store'
import { TIPO_UNIDAD_LABELS } from '../types/unidades.types'

const route  = useRoute()
const router = useRouter()
const store  = useUnidadesStore()

const accionando = ref(false)

onMounted(() => store.fetchById(route.params.id as string))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}

async function onDesactivar() {
  if (!store.current) return
  const accion = store.current.activo ? 'desactivar' : 'activar'
  if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} la unidad "${store.current.nombre}"?`)) return
  accionando.value = true
  try {
    await store.deactivate(store.current.id)
  } finally {
    accionando.value = false
  }
}

async function onEliminar() {
  if (!store.current) return
  if (!confirm(`¿Eliminar la unidad "${store.current.nombre}"? Esta acción es permanente.`)) return
  accionando.value = true
  try {
    await store.remove(store.current.id)
    router.push('/unidades')
  } finally {
    accionando.value = false
  }
}
</script>