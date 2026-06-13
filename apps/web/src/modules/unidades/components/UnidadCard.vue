<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4">

    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-gray-900 truncate">{{ unidad.nombre }}</h3>
        <p class="text-sm text-gray-500 capitalize mt-0.5">{{ unidad.tipo }}</p>
      </div>
      <span :class="estadoClass" class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap">
        {{ unidad.estado.replace('_', ' ') }}
      </span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 text-center">
      <div>
        <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Piso</p>
        <p class="text-sm font-bold text-gray-800 mt-0.5">{{ unidad.piso ?? '—' }}</p>
      </div>
      <div class="border-x border-gray-200">
        <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Área</p>
        <p class="text-sm font-bold text-gray-800 mt-0.5">
          {{ unidad.area_m2 ? `${unidad.area_m2}m²` : '—' }}
        </p>
      </div>
      <div>
        <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Coef.</p>
        <p class="text-sm font-bold text-gray-800 mt-0.5">
          {{ unidad.coeficiente ? `${unidad.coeficiente}%` : '—' }}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <span
        :class="unidad.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
        class="text-xs font-medium px-2 py-0.5 rounded-full"
      >
        {{ unidad.activo ? 'Activa' : 'Inactiva' }}
      </span>
      <span class="text-xs text-gray-400">{{ formatDate(unidad.created_at) }}</span>
    </div>

    <!-- Acciones -->
    <div class="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
      <router-link
        :to="`/unidades/${unidad.id}`"
        class="text-center text-xs font-semibold text-blue-600 hover:text-blue-800 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Ver
      </router-link>
      <router-link
        :to="`/unidades/${unidad.id}/editar`"
        class="text-center text-xs font-semibold text-gray-600 hover:text-gray-900 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Editar
      </router-link>
      <button
        @click="$emit('eliminar', unidad.id)"
        class="text-xs font-semibold text-red-500 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Unidad } from '../types/unidades.types'

const props = defineProps<{ unidad: Unidad }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()

const estadoClass = computed(() => ({
  ocupado:    'bg-green-100 text-green-700',
  desocupado: 'bg-gray-100 text-gray-600',
  en_mora:    'bg-red-100 text-red-700',
  bloqueado:  'bg-yellow-100 text-yellow-700',
}[props.unidad.estado] ?? 'bg-gray-100 text-gray-600'))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' })
}
</script>