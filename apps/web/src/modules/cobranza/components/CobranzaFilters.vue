<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <!-- Búsqueda -->
      <div class="lg:col-span-2">
        <label class="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
        <input
          v-model="local.search"
          type="search"
          placeholder="Recibo, concepto..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @input="onSearchInput"
        />
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select
          v-model="local.estado"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emitApply"
        >
          <option
            v-for="e in ESTADOS_COBRANZA_OPTIONS"
            :key="e.value"
            :value="e.value"
          >
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
          @change="emitApply"
        />
      </div>

      <!-- Fecha hasta -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Vence hasta</label>
        <input
          v-model="local.fechaHasta"
          type="date"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emitApply"
        />
      </div>
    </div>

    <div class="flex justify-end mt-3">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 underline"
        @click="reset"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ESTADOS_COBRANZA_OPTIONS } from '../types/cobranza.types'
import type { CobranzaFilters, EstadoCobranzaFilter } from '../types/cobranza.types'

const props = defineProps<{ modelValue?: CobranzaFilters }>()
const emit  = defineEmits<{ (e: 'apply', filters: CobranzaFilters): void }>()

// Estado local con el tipo correcto que incluye ''
const local = reactive<{
  search:     string
  estado:     EstadoCobranzaFilter
  fechaDesde: string
  fechaHasta: string
}>({
  search:     props.modelValue?.search     ?? '',
  estado:     props.modelValue?.estado     ?? '',
  fechaDesde: props.modelValue?.fechaDesde ?? '',
  fechaHasta: props.modelValue?.fechaHasta ?? '',
})

let searchTimer: ReturnType<typeof setTimeout>

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emitApply(), 400)
}

function emitApply() {
  const filters: CobranzaFilters = {}
  if (local.search)     filters.search     = local.search
  if (local.estado)     filters.estado     = local.estado   // '' es falsy, no se envía
  if (local.fechaDesde) filters.fechaDesde = local.fechaDesde
  if (local.fechaHasta) filters.fechaHasta = local.fechaHasta
  emit('apply', filters)
}

function reset() {
  local.search     = ''
  local.estado     = ''
  local.fechaDesde = ''
  local.fechaHasta = ''
  emit('apply', {})
}
</script>