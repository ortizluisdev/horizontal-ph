<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Presupuesto</h1>
      <p class="text-sm text-gray-500 mt-0.5">Control presupuestal del conjunto</p>
    </div>

    <!-- Stats resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Presupuestado</p>
        <p class="text-2xl font-bold text-gray-900">{{ fmt(totalPresupuestado) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ejecutado</p>
        <p class="text-2xl font-bold text-blue-700">{{ fmt(totalEjecutado) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Disponible</p>
        <p class="text-2xl font-bold" :class="disponible >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ fmt(disponible) }}
        </p>
      </div>
    </div>

    <!-- Tabla -->
    <PresupuestoTable :lineas="lineasMock" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PresupuestoTable from '../components/PresupuestoTable.vue'
import type { LineaPresupuesto } from '../types/contabilidad.types'

// Mock hasta que haya endpoint de presupuesto
const lineasMock = ref<LineaPresupuesto[]>([
  { id: '1', categoria: 'cuota_administracion', descripcion: 'Cuotas mensuales', presupuestado: 12000000, ejecutado: 9800000, diferencia: 2200000, porcentaje: 82 },
  { id: '2', categoria: 'mantenimiento',        descripcion: 'Mantenimiento zonas comunes', presupuestado: 3000000, ejecutado: 3500000, diferencia: -500000, porcentaje: 117 },
  { id: '3', categoria: 'servicios_publicos',   descripcion: 'Agua, luz y gas',   presupuestado: 2500000, ejecutado: 2100000, diferencia: 400000,  porcentaje: 84 },
  { id: '4', categoria: 'nomina',               descripcion: 'Personal administrativo', presupuestado: 4000000, ejecutado: 4000000, diferencia: 0, porcentaje: 100 },
  { id: '5', categoria: 'seguros',              descripcion: 'Pólizas de seguro', presupuestado: 1200000, ejecutado: 600000, diferencia: 600000,  porcentaje: 50 },
])

const totalPresupuestado = computed(() => lineasMock.value.reduce((s, l) => s + l.presupuestado, 0))
const totalEjecutado     = computed(() => lineasMock.value.reduce((s, l) => s + l.ejecutado, 0))
const disponible         = computed(() => totalPresupuestado.value - totalEjecutado.value)

function fmt(val: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>