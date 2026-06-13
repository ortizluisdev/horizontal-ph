<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Movimientos</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ store.total }} movimiento{{ store.total !== 1 ? 's' : '' }} registrado{{ store.total !== 1 ? 's' : '' }}</p>
      </div>
      <router-link to="/contabilidad" class="text-sm text-blue-600 hover:underline">← Libro Mayor</router-link>
    </div>

    <ReporteFilters @change="onFilter" />

    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <LibroMayorTable v-else :movimientos="store.list" @anular="onAnular" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useContabilidad } from '../composables/useContabilidad'
import { useContabilidadStore } from '../store/contabilidad.store'
import ReporteFilters from '../components/ReporteFilters.vue'
import LibroMayorTable from '../components/LibroMayorTable.vue'
import type { MovimientoQuery } from '../types/contabilidad.types'

const { loading, anular, cargarLista } = useContabilidad()
const store = useContabilidadStore()
const activeFilters = ref<MovimientoQuery>({})

function onFilter(f: MovimientoQuery) {
  activeFilters.value = f
  cargarLista({ ...f, page: 1, limit: 20 })
}

async function onAnular(id: string) {
  const motivo = prompt('Motivo de anulación (mínimo 10 caracteres):')
  if (!motivo || motivo.length < 10) return
  await anular(id, { motivo_anulacion: motivo })
}

onMounted(() => cargarLista({ page: 1, limit: 20 }))
</script>