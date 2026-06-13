<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Presupuestado</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ejecutado</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Diferencia</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Avance</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!lineas.length">
          <td colspan="6" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <span class="text-4xl">📋</span>
              <p class="text-sm font-medium">Sin líneas de presupuesto</p>
            </div>
          </td>
        </tr>
        <tr v-for="l in lineas" :key="l.id" class="hover:bg-gray-50/60 transition-colors">
          <td class="px-4 py-3">
            <span class="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {{ l.categoria.replace(/_/g, ' ') }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-600 text-xs">{{ l.descripcion }}</td>
          <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ fmt(l.presupuestado) }}</td>
          <td class="px-4 py-3 text-right font-semibold text-gray-700">{{ fmt(l.ejecutado) }}</td>
          <td class="px-4 py-3 text-right font-bold" :class="l.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ l.diferencia >= 0 ? '+' : '' }}{{ fmt(l.diferencia) }}
          </td>
          <td class="px-4 py-3 min-w-[140px]">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :class="l.porcentaje > 100 ? 'bg-red-500' : l.porcentaje > 80 ? 'bg-yellow-500' : 'bg-green-500'"
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: Math.min(l.porcentaje, 100) + '%' }"
                />
              </div>
              <span class="text-xs font-semibold text-gray-600 w-9 text-right">{{ l.porcentaje }}%</span>
            </div>
          </td>
        </tr>
      </tbody>

      <!-- Totales -->
      <tfoot v-if="lineas.length" class="bg-gray-50 border-t-2 border-gray-200">
        <tr>
          <td colspan="2" class="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Totales</td>
          <td class="px-4 py-3 text-right text-sm font-bold text-gray-800">{{ fmt(totalPresupuestado) }}</td>
          <td class="px-4 py-3 text-right text-sm font-bold text-gray-700">{{ fmt(totalEjecutado) }}</td>
          <td class="px-4 py-3 text-right text-sm font-bold" :class="totalDiferencia >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ totalDiferencia >= 0 ? '+' : '' }}{{ fmt(totalDiferencia) }}
          </td>
          <td class="px-4 py-3 text-xs font-semibold text-gray-600">
            {{ pctTotal }}% ejecutado
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LineaPresupuesto } from '../types/contabilidad.types'

const props = withDefaults(defineProps<{ lineas?: LineaPresupuesto[] }>(), { lineas: () => [] })

const totalPresupuestado = computed(() => props.lineas.reduce((s, l) => s + l.presupuestado, 0))
const totalEjecutado     = computed(() => props.lineas.reduce((s, l) => s + l.ejecutado, 0))
const totalDiferencia    = computed(() => totalPresupuestado.value - totalEjecutado.value)
const pctTotal           = computed(() => {
  if (!totalPresupuestado.value) return 0
  return Math.round((totalEjecutado.value / totalPresupuestado.value) * 100)
})

function fmt(val: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>