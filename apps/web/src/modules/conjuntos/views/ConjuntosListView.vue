<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Conjuntos</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ total }} conjunto{{ total !== 1 ? 's' : '' }} registrado{{ total !== 1 ? 's' : '' }}</p>
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
    <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{{ error }}</p>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Tabla -->
    <ConjuntoTable v-else :conjuntos="list" @eliminar="onEliminar" />

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2">
      <button
        v-for="p in totalPages"
        :key="p"
        @click="cambiarPagina(p)"
        :class="p === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
        class="w-9 h-9 rounded-lg text-sm font-medium hover:opacity-80 transition"
      >
        {{ p }}
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

const { list, total, loading, error, cargarLista, eliminar } = useConjuntos()

const currentPage = ref(1)
const limit = 20
const activeFilters = ref<ConjuntoQuery>({})

const totalPages = computed(() => Math.ceil(total.value / limit))

function onFilter(filters: ConjuntoQuery) {
  activeFilters.value = filters
  currentPage.value = 1
  cargarLista({ ...filters, page: 1, limit })
}

function cambiarPagina(p: number) {
  currentPage.value = p
  cargarLista({ ...activeFilters.value, page: p, limit })
}

async function onEliminar(id: string) {
  if (!confirm('¿Estás seguro de eliminar este conjunto?')) return
  await eliminar(id)
}

onMounted(() => cargarLista({ page: 1, limit }))
</script>