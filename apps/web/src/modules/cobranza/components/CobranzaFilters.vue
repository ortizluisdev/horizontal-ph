<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Estado -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select
          v-model="local.estado"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
        >
          <option v-for="e in ESTADOS_COBRANZA" :key="e.value" :value="e.value">
            {{ e.label }}
          </option>
        </select>
      </div>

      <!-- Mes -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Mes</label>
        <select
          v-model.number="local.mes"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
        >
          <option :value="undefined">Todos</option>
          <option v-for="m in MESES" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <!-- Año -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Año</label>
        <select
          v-model.number="local.anio"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
        >
          <option :value="undefined">Todos</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- Fecha desde -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Vence desde</label>
        <input
          v-model="local.fechaDesde"
          type="date"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      <!-- Fecha hasta -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Vence hasta</label>
        <input
          v-model="local.fechaHasta"
          type="date"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      <!-- Acciones -->
      <div class="flex items-end gap-2">
        <button
          class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          @click="emit('apply', local)"
        >
          Aplicar
        </button>
        <button
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          @click="reset"
          title="Limpiar filtros"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ESTADOS_COBRANZA, MESES } from '../composables/useCobranza'
import type { CobranzaFilters } from '../types/cobranza.types'

const props = defineProps<{ modelValue?: CobranzaFilters }>()
const emit  = defineEmits<{
  (e: 'apply', filters: CobranzaFilters): void
}>()

const local = reactive<CobranzaFilters>({
  estado:     props.modelValue?.estado     ?? '',
  fechaDesde: props.modelValue?.fechaDesde ?? '',
  fechaHasta: props.modelValue?.fechaHasta ?? '',
  mes:        props.modelValue?.mes,
  anio:       props.modelValue?.anio,
})

const currentYear = new Date().getFullYear()
const years = computed(() =>
  Array.from({ length: 6 }, (_, i) => currentYear - i)
)

function reset() {
  local.estado     = ''
  local.fechaDesde = ''
  local.fechaHasta = ''
  local.mes        = undefined
  local.anio       = undefined
  emit('apply', { ...local })
}
</script>