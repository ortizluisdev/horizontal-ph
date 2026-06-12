<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
    <div class="flex flex-col gap-1 min-w-[160px]">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
      <select
        v-model="filters.tipo_conjunto"
        @change="emitir"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos</option>
        <option value="residencial">Residencial</option>
        <option value="comercial">Comercial</option>
        <option value="mixto">Mixto</option>
        <option value="industrial">Industrial</option>
        <option value="otro">Otro</option>
      </select>
    </div>

    <div class="flex flex-col gap-1 min-w-[140px]">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
      <select
        v-model="filters.activo"
        @change="emitir"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos</option>
        <option :value="true">Activos</option>
        <option :value="false">Inactivos</option>
      </select>
    </div>

    <button
      @click="limpiar"
      class="ml-auto text-sm text-gray-500 hover:text-gray-700 underline"
    >
      Limpiar filtros
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { ConjuntoQuery } from '../types/conjuntos.types'

const emit = defineEmits<{ (e: 'change', filters: ConjuntoQuery): void }>()

const filters = reactive<ConjuntoQuery>({
  tipo_conjunto: undefined,
  activo: undefined,
})

function emitir() {
  emit('change', { ...filters })
}

function limpiar() {
  filters.tipo_conjunto = undefined
  filters.activo = undefined
  emitir()
}
</script>