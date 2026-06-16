<template>
  <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Volver">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-900">Detalle de unidad</h1>
    </div>

    <div v-if="store.loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>

    <p v-else-if="store.error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      {{ store.error }}
    </p>

    <template v-else-if="unidad">

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ unidad.nombre }}</h2>
            <p v-if="unidad.numero_unidad || unidad.torre" class="text-sm text-gray-400 mt-0.5">
              <span v-if="unidad.numero_unidad"># {{ unidad.numero_unidad }}</span>
              <span v-if="unidad.numero_unidad && unidad.torre"> · </span>
              <span v-if="unidad.torre">Torre {{ unidad.torre }}</span>
            </p>
            <p class="text-sm text-gray-500 mt-1">
              {{ unidad.tipo_unidad ? TIPO_UNIDAD_LABELS[unidad.tipo_unidad] : 'Sin tipo definido' }}
            </p>
            <p v-if="unidad.descripcion" class="text-sm text-gray-400 mt-1 max-w-md">{{ unidad.descripcion }}</p>
          </div>
          <span :class="unidad.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            class="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            {{ unidad.activo ? '● Activa' : '● Inactiva' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Características</h3>
          <dl class="space-y-2">
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Piso</dt><dd class="text-sm text-gray-800">{{ unidad.piso ?? '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Área</dt><dd class="text-sm text-gray-800">{{ unidad.area_m2 ? `${unidad.area_m2} m²` : '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Tipo</dt><dd class="text-sm text-gray-800">{{ unidad.tipo_unidad ? TIPO_UNIDAD_LABELS[unidad.tipo_unidad] : '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Torre</dt><dd class="text-sm text-gray-800">{{ unidad.torre ?? '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-xs text-gray-400">N° de unidad</dt><dd class="text-sm text-gray-800">{{ unidad.numero_unidad ?? '—' }}</dd></div>
          </dl>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Conjunto y metadata</h3>
          <dl class="space-y-2">
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Conjunto</dt><dd class="text-sm text-gray-800">{{ unidad.conjunto_nombre ?? '—' }}</dd></div>
            <div>
              <dt class="text-xs text-gray-400 mb-0.5">ID de unidad</dt>
              <dd class="text-xs font-mono text-gray-600 bg-gray-50 rounded px-2 py-1 break-all select-all">{{ unidad.id }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400 mb-0.5">ID de conjunto</dt>
              <dd class="text-xs font-mono text-gray-600 bg-gray-50 rounded px-2 py-1 break-all select-all">{{ unidad.conjunto_id }}</dd>
            </div>
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Creada</dt><dd class="text-sm text-gray-800">{{ formatDate(unidad.created_at) }}</dd></div>
            <div class="flex justify-between"><dt class="text-xs text-gray-400">Actualizada</dt><dd class="text-sm text-gray-800">{{ formatDate(unidad.updated_at) }}</dd></div>
          </dl>
        </div>
      </div>

      <div class="flex gap-3 flex-wrap">
        <router-link :to="`/unidades/${unidad.id}/editar`"
          class="flex-1 text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Editar unidad
        </router-link>
        <button @click="onDesactivar" :disabled="accionando"
          class="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors">
          {{ accionando ? 'Procesando...' : (unidad.activo ? 'Desactivar' : 'Activar') }}
        </button>
        <router-link :to="`/conjuntos/${unidad.conjunto_id}`"
          class="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Ver conjunto
        </router-link>
      </div>

      <div class="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-red-700 mb-1">Zona de peligro</h3>
        <p class="text-xs text-red-500 mb-3">Elimina permanentemente la unidad. Esta acción no se puede deshacer.</p>
        <button @click="onEliminar" :disabled="accionando"
          class="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {{ accionando ? 'Eliminando...' : 'Eliminar unidad' }}
        </button>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUnidadesStore } from '../store/unidades.store'
import { TIPO_UNIDAD_LABELS } from '../types/unidades.types'

const route  = useRoute()
const router = useRouter()
const store  = useUnidadesStore()

const accionando = ref(false)
const unidad     = computed(() => store.current)

onMounted(() => store.fetchById(route.params.id as string))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}

async function onDesactivar() {
  if (!unidad.value) return
  const accion = unidad.value.activo ? 'desactivar' : 'activar'
  if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} la unidad "${unidad.value.nombre}"?`)) return
  accionando.value = true
  try {
    if (unidad.value.activo) await store.deactivate(unidad.value.id)
    else await store.update(unidad.value.id, { activo: true })
    await store.fetchById(route.params.id as string)
  } finally { accionando.value = false }
}

async function onEliminar() {
  if (!unidad.value) return
  if (!confirm(`¿Eliminar la unidad "${unidad.value.nombre}"? Esta acción es permanente.`)) return
  accionando.value = true
  try { await store.remove(unidad.value.id); router.push('/unidades') }
  finally { accionando.value = false }
}
</script>