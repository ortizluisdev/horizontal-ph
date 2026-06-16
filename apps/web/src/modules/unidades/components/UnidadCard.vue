<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-gray-900 truncate">{{ unidad.nombre }}</h3>
        <p v-if="unidad.numero_unidad || unidad.torre" class="text-xs text-gray-400 mt-0.5">
          <span v-if="unidad.numero_unidad"># {{ unidad.numero_unidad }}</span>
          <span v-if="unidad.numero_unidad && unidad.torre"> · </span>
          <span v-if="unidad.torre">Torre {{ unidad.torre }}</span>
        </p>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ unidad.tipo_unidad ? TIPO_UNIDAD_LABELS[unidad.tipo_unidad] : 'Sin tipo' }}
        </p>
      </div>
      <span :class="unidad.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
        class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full">
        {{ unidad.activo ? 'Activa' : 'Inactiva' }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3 text-center">
      <div>
        <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Piso</p>
        <p class="text-sm font-bold text-gray-800 mt-0.5">{{ unidad.piso ?? '—' }}</p>
      </div>
      <div class="border-l border-gray-200">
        <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Área</p>
        <p class="text-sm font-bold text-gray-800 mt-0.5">{{ unidad.area_m2 ? `${unidad.area_m2} m²` : '—' }}</p>
      </div>
    </div>

    <div v-if="unidad.conjunto_nombre" class="flex items-center gap-1.5 text-xs text-gray-500">
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
      <span class="truncate">{{ unidad.conjunto_nombre }}</span>
    </div>

    <p v-if="unidad.descripcion" class="text-xs text-gray-400 line-clamp-2">{{ unidad.descripcion }}</p>
    <span class="text-xs text-gray-400">Creada {{ formatDate(unidad.created_at) }}</span>

    <div class="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
      <router-link :to="`/unidades/${unidad.id}`"
        class="text-center text-xs font-semibold text-blue-600 hover:text-blue-800 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Ver</router-link>
      <router-link :to="`/unidades/${unidad.id}/editar`"
        class="text-center text-xs font-semibold text-gray-600 hover:text-gray-900 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Editar</router-link>
      <button @click="$emit('eliminar', unidad.id)"
        class="text-xs font-semibold text-red-500 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Unidad } from '../types/unidades.types'
import { TIPO_UNIDAD_LABELS } from '../types/unidades.types'

defineProps<{ unidad: Unidad }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' })
}
</script>