<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Conjuntos</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ total }} conjunto{{ total !== 1 ? 's' : '' }} registrado{{ total !== 1 ? 's' : '' }}
        </p>
      </div>
      <router-link
        to="/conjuntos/nuevo"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        + Nuevo conjunto
      </router-link>
    </div>

    <!-- Filtros -->
    <ConjuntoFilters @change="onFilter" />

    <!-- Error -->
    <p
      v-if="error"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      {{ error }}
    </p>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Tabla -->
    <ConjuntoTable v-else :conjuntos="list" @eliminar="onEliminar" />

    <!-- Paginación -->
    <div v-if="pages > 1" class="flex justify-center items-center gap-1">
      <button
        @click="cambiarPagina(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-9 h-9 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ‹
      </button>
      <button
        v-for="p in pageRange"
        :key="p"
        @click="cambiarPagina(p)"
        :class="p === currentPage
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        class="w-9 h-9 rounded-lg text-sm font-medium border transition"
      >
        {{ p }}
      </button>
      <button
        @click="cambiarPagina(currentPage + 1)"
        :disabled="currentPage === pages"
        class="w-9 h-9 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConjuntos } from '../composables/useConjuntos'
import ConjuntoFilters from '../components/ConjuntoFilters.vue'
import ConjuntoTable from '../components/ConjuntoTable.vue'
import type { ConjuntoQuery } from '../types/conjuntos.types'

const { list, total, pages, loading, error, cargarLista, eliminar } = useConjuntos()

const LIMIT = 20
const currentPage    = ref(1)
const activeFilters  = ref<ConjuntoQuery>({})

// Muestra máximo 7 páginas alrededor de la actual
const pageRange = computed(() => {
  const total = pages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const start = Math.max(1, currentPage.value - 3)
  const end   = Math.min(total, start + 6)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function onFilter(filters: ConjuntoQuery) {
  activeFilters.value = filters
  currentPage.value   = 1
  cargarLista({ ...filters, page: 1, limit: LIMIT })
}

function cambiarPagina(p: number) {
  if (p < 1 || p > pages.value) return
  currentPage.value = p
  cargarLista({ ...activeFilters.value, page: p, limit: LIMIT })
}

async function onEliminar(id: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar este conjunto? Esta acción no se puede deshacer.')) return
  await eliminar(id)
}

onMounted(() => cargarLista({ page: 1, limit: LIMIT }))
</script>