<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
    <!-- Búsqueda -->
    <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Buscar</label>
      <input
        v-model="filters.search"
        type="search"
        placeholder="Nombre, dirección, ciudad..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @input="onSearchInput"
      />
    </div>

    <!-- Tipo -->
    <div class="flex flex-col gap-1 min-w-[160px]">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
      <select
        v-model="filters.tipo_conjunto"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="emitir"
      >
        <option value="">Todos</option>
        <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Estado -->
    <div class="flex flex-col gap-1 min-w-[140px]">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
      <select
        v-model="filters.activo"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="emitir"
      >
        <option value="">Todos</option>
        <option :value="true">Activos</option>
        <option :value="false">Inactivos</option>
      </select>
    </div>

    <button
      @click="limpiar"
      class="ml-auto self-end text-sm text-gray-500 hover:text-gray-700 underline pb-2"
    >
      Limpiar filtros
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { ConjuntoQuery, TipoConjunto } from '../types/conjuntos.types'
import { TIPO_CONJUNTO_OPTIONS } from '../types/conjuntos.types'

const emit = defineEmits<{ (e: 'change', filters: ConjuntoQuery): void }>()

const tipoOptions = TIPO_CONJUNTO_OPTIONS

const filters = reactive<{
  search: string
  tipo_conjunto: TipoConjunto | ''
  activo: boolean | ''
}>({
  search:        '',
  tipo_conjunto: '',
  activo:        '',
})

let searchTimer: ReturnType<typeof setTimeout>

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emitir(), 400)
}

function emitir() {
  const query: ConjuntoQuery = {}
  if (filters.search)                       query.search        = filters.search
  if (filters.tipo_conjunto !== '')         query.tipo_conjunto = filters.tipo_conjunto as TipoConjunto
  if (filters.activo        !== '')         query.activo        = filters.activo as boolean
  emit('change', query)
}

function limpiar() {
  filters.search        = ''
  filters.tipo_conjunto = ''
  filters.activo        = ''
  emit('change', {})
}
</script>