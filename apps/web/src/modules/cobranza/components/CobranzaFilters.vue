<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Estado -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select
          v-model="local.estado"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
        >
          <option v-for="e in ESTADOS_COBRANZA" :key="e.value" :value="e.value">
            {{ e.label }}
          </option>
        </select>
      </div>

      <!-- Fecha desde -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Vence desde</label>
        <input
          v-model="local.fechaDesde"
          type="date"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
        />
      </div>

      <!-- Fecha hasta -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Vence hasta</label>
        <input
          v-model="local.fechaHasta"
          type="date"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
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
        >
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ESTADOS_COBRANZA } from '../composables/useCobranza'
import type { CobranzaFilters } from '../types/cobranza.types'

const props = defineProps<{ modelValue?: CobranzaFilters }>()
const emit  = defineEmits<{
  (e: 'change', filters: CobranzaFilters): void
  (e: 'apply',  filters: CobranzaFilters): void
}>()

const local = reactive<CobranzaFilters>({
  estado:     props.modelValue?.estado     ?? '',
  fechaDesde: props.modelValue?.fechaDesde ?? '',
  fechaHasta: props.modelValue?.fechaHasta ?? '',
})

function reset() {
  local.estado     = ''
  local.fechaDesde = ''
  local.fechaHasta = ''
  emit('apply', local)
}
</script>