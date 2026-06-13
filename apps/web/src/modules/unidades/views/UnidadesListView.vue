<template>
  <div class="p-6 space-y-6">

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
        <span class="text-base leading-none">+</span> Nueva unidad
      </router-link>
    </div>

    <!-- Filtros -->
    <UnidadFilters @change="onFilter" />

    <!-- Error -->
    <div
      v-if="error"
      class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      <span>⚠️</span> {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm text-gray-400">Cargando unidades...</p>
    </div>

    <!-- Tabla -->
    <UnidadTable
      v-else
      :unidades="store.list"
      @eliminar="onEliminar"
    />

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 pt-2">
      <button
        @click="cambiarPagina(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-9 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="cambiarPagina(p)"
        :class="p === currentPage
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        class="w-9 h-9 rounded-lg border text-sm font-medium transition-colors"
      >
        {{ p }}
      </button>
      <button
        @click="cambiarPagina(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-9 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUnidades } from '../composables/useUnidades'
import { useUnidadesStore } from '../store/unidades.store'
import UnidadFilters from '../components/UnidadFilters.vue'
import UnidadTable from '../components/UnidadTable.vue'
import type { UnidadQuery } from '../types/unidades.types'

const { loading, error, cargarLista, eliminar } = useUnidades()
const store = useUnidadesStore()

const currentPage    = ref(1)
const limit          = 20
const activeFilters  = ref<UnidadQuery>({})
const totalPages     = computed(() => Math.max(1, Math.ceil(store.total / limit)))

function onFilter(filters: UnidadQuery) {
  activeFilters.value = filters
  currentPage.value   = 1
  cargarLista({ ...filters, page: 1, limit })
}

function cambiarPagina(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  cargarLista({ ...activeFilters.value, page: p, limit })
}

async function onEliminar(id: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta unidad? Esta acción no se puede deshacer.')) return
  await eliminar(id)
}

onMounted(() => cargarLista({ page: 1, limit }))
</script>