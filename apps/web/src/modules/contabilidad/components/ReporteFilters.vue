<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex flex-wrap gap-3 items-end">

      <!-- Fecha desde -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</label>
        <input
          v-model="filters.fechaDesde"
          type="date"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Fecha hasta -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hasta</label>
        <input
          v-model="filters.fechaHasta"
          type="date"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tipo -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
        <select
          v-model="filters.tipo_movimiento"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
          <option value="ajuste">Ajuste</option>
          <option value="traslado">Traslado</option>
          <option value="apertura">Apertura</option>
          <option value="cierre">Cierre</option>
        </select>
      </div>

      <!-- Categoría -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</label>
        <select
          v-model="filters.categoria"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option value="cuota_administracion">Cuota administración</option>
          <option value="cuota_extraordinaria">Cuota extraordinaria</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="servicios_publicos">Servicios públicos</option>
          <option value="nomina">Nómina</option>
          <option value="seguros">Seguros</option>
          <option value="impuestos">Impuestos</option>
          <option value="reparaciones">Reparaciones</option>
          <option value="arrendamiento">Arrendamiento</option>
          <option value="intereses">Intereses</option>
          <option value="multas">Multas</option>
          <option value="reservas">Reservas</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Estado -->
      <div class="flex flex-col gap-1 min-w-[130px]">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
        <select
          v-model="filters.estado"
          @change="emitir"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="anulado">Anulado</option>
        </select>
      </div>

      <!-- Limpiar -->
      <button
        @click="limpiar"
        class="text-sm text-gray-400 hover:text-red-500 underline transition-colors pb-0.5"
      >
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { MovimientoQuery } from '../types/contabilidad.types'

const emit = defineEmits<{ (e: 'change', filters: MovimientoQuery): void }>()

const filters = reactive<MovimientoQuery>({
  fechaDesde:      undefined,
  fechaHasta:      undefined,
  tipo_movimiento: undefined,
  categoria:       undefined,
  estado:          undefined,
})

function emitir() {
  const clean: MovimientoQuery = {}
  if (filters.fechaDesde)      clean.fechaDesde      = filters.fechaDesde
  if (filters.fechaHasta)      clean.fechaHasta      = filters.fechaHasta
  if (filters.tipo_movimiento) clean.tipo_movimiento = filters.tipo_movimiento
  if (filters.categoria)       clean.categoria       = filters.categoria
  if (filters.estado)          clean.estado          = filters.estado
  emit('change', clean)
}

function limpiar() {
  filters.fechaDesde      = undefined
  filters.fechaHasta      = undefined
  filters.tipo_movimiento = undefined
  filters.categoria       = undefined
  filters.estado          = undefined
  emit('change', {})
}
</script>