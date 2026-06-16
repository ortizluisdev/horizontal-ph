<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex flex-wrap gap-3 items-end">

      <!-- Buscar -->
      <div class="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buscar</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <input
            v-model="filters.search"
            @input="onSearchInput"
            type="text"
            placeholder="Nombre, número..."
            class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <!-- Tipo (alineado con backend: tipo_unidad) -->
      <div class="flex flex-col gap-1 min-w-[160px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
        <select
          v-model="filters.tipo_unidad"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">Todos los tipos</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="local_comercial">Local comercial</option>
          <option value="oficina">Oficina</option>
          <option value="bodega">Bodega</option>
          <option value="parqueadero">Parqueadero</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Piso -->
      <div class="flex flex-col gap-1 min-w-[100px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Piso</label>
        <input
          v-model.number="filters.piso"
          @input="emitir"
          type="number"
          placeholder="Ej: 3"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- Activo -->
      <div class="flex flex-col gap-1 min-w-[120px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activa</label>
        <select
          v-model="filters.activo"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">Todas</option>
          <option :value="true">Sí</option>
          <option :value="false">No</option>
        </select>
      </div>

      <!-- Limpiar -->
      <button
        @click="limpiar"
        class="text-sm text-gray-400 hover:text-red-500 underline transition-colors whitespace-nowrap pb-2"
      >
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onBeforeUnmount } from 'vue'
import type { UnidadQuery } from '../types/unidades.types'

const emit = defineEmits<{ (e: 'change', filters: UnidadQuery): void }>()

// Omitimos 'activo' de UnidadQuery para poder redefinirlo localmente
// como boolean | '' (el '' representa "sin filtro" en el <select>).
type UnidadFiltersState = Omit<UnidadQuery, 'activo'> & {
  activo: boolean | ''
}

const filters = reactive<UnidadFiltersState>({
  search:      undefined,
  tipo_unidad: undefined,
  piso:        undefined,
  activo:      '',
})

let searchTimeout: ReturnType<typeof setTimeout> | undefined

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(emitir, 300)
}

function emitir() {
  const clean: UnidadQuery = {}

  if (filters.search) clean.search = filters.search
  if (filters.tipo_unidad) clean.tipo_unidad = filters.tipo_unidad
  if (filters.piso !== undefined && filters.piso !== null && !Number.isNaN(filters.piso)) {
    clean.piso = filters.piso
  }
  if (filters.activo !== '') clean.activo = filters.activo

  emit('change', clean)
}

function limpiar() {
  if (searchTimeout) clearTimeout(searchTimeout)
  filters.search      = undefined
  filters.tipo_unidad = undefined
  filters.piso        = undefined
  filters.activo      = ''
  emit('change', {})
}

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>