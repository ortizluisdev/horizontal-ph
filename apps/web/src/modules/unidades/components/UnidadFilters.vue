<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex flex-wrap gap-3 items-end">

      <!-- Buscar -->
      <div class="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buscar</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            v-model="filters.search"
            @input="emitir"
            type="text"
            placeholder="Nombre de unidad..."
            class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Tipo -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
        <select
          v-model="filters.tipo"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="local">Local</option>
          <option value="parqueadero">Parqueadero</option>
          <option value="bodega">Bodega</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Estado -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
        <select
          v-model="filters.estado"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="ocupado">Ocupado</option>
          <option value="desocupado">Desocupado</option>
          <option value="en_mora">En mora</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
      </div>

      <!-- Activo -->
      <div class="flex flex-col gap-1 min-w-[120px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activa</label>
        <select
          v-model="filters.activo"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option :value="true">Sí</option>
          <option :value="false">No</option>
        </select>
      </div>

      <!-- Limpiar -->
      <button
        @click="limpiar"
        class="pb-0.5 text-sm text-gray-400 hover:text-red-500 underline transition-colors whitespace-nowrap"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { UnidadQuery } from '../types/unidades.types'

const emit = defineEmits<{ (e: 'change', filters: UnidadQuery): void }>()

const filters = reactive<UnidadQuery>({
  search: undefined,
  tipo:   undefined,
  estado: undefined,
  activo: undefined,
})

function emitir() {
  const clean: UnidadQuery = {}
  if (filters.search) clean.search = filters.search
  if (filters.tipo)   clean.tipo   = filters.tipo
  if (filters.estado) clean.estado = filters.estado
  if (filters.activo !== undefined && filters.activo !== ('' as any)) clean.activo = filters.activo
  emit('change', clean)
}

function limpiar() {
  filters.search = undefined
  filters.tipo   = undefined
  filters.estado = undefined
  filters.activo = undefined
  emit('change', {})
}
</script>