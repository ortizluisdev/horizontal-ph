<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Reportes contables</h1>
      <p class="text-sm text-gray-500 mt-0.5">Genera y exporta reportes financieros del conjunto</p>
    </div>

    <!-- Filtros -->
    <ReporteFilters @change="onFilter" />

    <!-- Grid de reportes disponibles -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="reporte in reportes"
        :key="reporte.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ reporte.icon }}</span>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">{{ reporte.titulo }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ reporte.descripcion }}</p>
          </div>
        </div>
        <button
          @click="generarReporte(reporte.id)"
          class="mt-auto w-full border border-blue-200 text-blue-600 rounded-lg py-2 text-xs font-semibold hover:bg-blue-50 transition-colors"
        >
          Generar reporte
        </button>
      </div>
    </div>

    <!-- Movimientos filtrados -->
    <div v-if="store.list.length">
      <h2 class="text-base font-semibold text-gray-900 mb-3">
        Movimientos del período ({{ store.total }})
      </h2>
      <GraficoBalances :items="graficoData" />
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContabilidad } from '../composables/useContabilidad'
import { useContabilidadStore } from '../store/contabilidad.store'
import ReporteFilters from '../components/ReporteFilters.vue'
import GraficoBalances from '../components/GraficoBalances.vue'
import type { MovimientoQuery } from '../types/contabilidad.types'

const { loading, cargarLista } = useContabilidad()
const store = useContabilidadStore()

const reportes = [
  { id: 'libro_mayor',  icon: '📒', titulo: 'Libro mayor',       descripcion: 'Todos los movimientos contables del período' },
  { id: 'balance',      icon: '⚖️',  titulo: 'Balance general',   descripcion: 'Resumen de débitos, créditos y saldo neto' },
  { id: 'por_categoria',icon: '📊', titulo: 'Por categoría',     descripcion: 'Agrupación de movimientos por categoría' },
  { id: 'ingresos',     icon: '💚', titulo: 'Solo ingresos',     descripcion: 'Reporte de movimientos de tipo ingreso' },
  { id: 'egresos',      icon: '🔴', titulo: 'Solo egresos',      descripcion: 'Reporte de movimientos de tipo egreso' },
  { id: 'anulados',     icon: '🚫', titulo: 'Anulados',          descripcion: 'Movimientos anulados del período' },
]

const graficoData = computed(() => {
  const mapa = new Map<string, { debito: number; credito: number }>()
  for (const m of store.list) {
    if (m.estado === 'anulado') continue
    const curr = mapa.get(m.categoria) ?? { debito: 0, credito: 0 }
    curr.debito  += m.valor_debit
    curr.credito += m.valor_credit
    mapa.set(m.categoria, curr)
  }
  return Array.from(mapa.entries()).map(([categoria, vals]) => ({ categoria, ...vals }))
})

function onFilter(f: MovimientoQuery) {
  cargarLista({ ...f, page: 1, limit: 100 })
}

function generarReporte(id: string) {
  // Aquí iría la lógica de exportación cuando haya endpoint
  alert(`Generando reporte: ${id}\nFuncionalidad disponible próximamente.`)
}
</script>