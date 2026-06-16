<template>
  <div class="p-4 sm:p-6 space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Unidades</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ store.total }} unidad{{ store.total !== 1 ? 'es' : '' }} registrada{{ store.total !== 1 ? 's' : '' }}
        </p>
      </div>
      <router-link
        to="/unidades/nuevo"
        class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nueva unidad
      </router-link>
    </div>

    <!-- Filtros -->
    <UnidadFilters @change="onFilter" />

    <!-- Error -->
    <div
      v-if="store.error"
      class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      {{ store.error }}
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm text-gray-400">Cargando unidades...</p>
    </div>

    <!-- Tabla desktop / Cards mobile -->
    <template v-else>
      <!-- Tabla (sm+) -->
      <div class="hidden sm:block">
        <UnidadTable
          :unidades="store.list"
          @eliminar="onEliminar"
          @desactivar="onDesactivar"
        />
      </div>

      <!-- Cards (mobile) -->
      <div class="grid grid-cols-1 gap-4 sm:hidden">
        <div v-if="!store.list.length" class="text-center py-16 text-gray-400">
          <p class="text-sm font-medium">No hay unidades registradas</p>
        </div>
        <UnidadCard
          v-for="u in store.list"
          :key="u.id"
          :unidad="u"
          @eliminar="onEliminar"
        />
      </div>
    </template>

    <!-- Paginación -->
    <div v-if="store.pages > 1" class="flex justify-center items-center gap-1.5 pt-2 flex-wrap">
      <button
        @click="cambiarPagina(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-9 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹
      </button>
      <template v-for="p in paginationRange" :key="p">
        <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
        <button
          v-else
          @click="cambiarPagina(Number(p))"
          :class="Number(p) === currentPage
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
          class="w-9 h-9 rounded-lg border text-sm font-medium transition-colors"
        >
          {{ p }}
        </button>
      </template>
      <button
        @click="cambiarPagina(currentPage + 1)"
        :disabled="currentPage === store.pages"
        class="w-9 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUnidadesStore } from '../store/unidades.store'
import UnidadFilters from '../components/UnidadFilters.vue'
import UnidadTable from '../components/UnidadTable.vue'
import UnidadCard from '../components/UnidadCard.vue'
import type { UnidadQuery } from '../types/unidades.types'

const store        = useUnidadesStore()
const currentPage  = ref(1)
const limit        = 20
const activeFilters = ref<UnidadQuery>({})

function onFilter(filters: UnidadQuery) {
  activeFilters.value = filters
  currentPage.value   = 1
  store.fetchList({ ...filters, page: 1, limit })
}

function cambiarPagina(p: number) {
  if (p < 1 || p > store.pages) return
  currentPage.value = p
  store.fetchList({ ...activeFilters.value, page: p, limit })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function onEliminar(id: string) {
  if (!confirm('¿Eliminar esta unidad? Esta acción es permanente.')) return
  await store.remove(id)
}

async function onDesactivar(id: string) {
  const u = store.list.find((x) => x.id === id)
  if (!u) return
  if (!confirm(`¿${u.activo ? 'Desactivar' : 'Activar'} la unidad "${u.nombre}"?`)) return
  await store.deactivate(id)
}

// Paginación con ellipsis
const paginationRange = computed<(number | '...')[]>(() => {
  const total = store.pages
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

onMounted(() => store.fetchList({ page: 1, limit }))
</script>