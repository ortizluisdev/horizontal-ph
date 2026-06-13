<template>
  <div
    class="group bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer space-y-3"
    @click="emit('select', pqrs)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xl shrink-0">{{ tipoIcon(pqrs.tipo) }}</span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ pqrs.asunto }}</p>
          <p class="text-xs font-mono text-gray-400 mt-0.5">{{ pqrs.numero_radicado }}</p>
        </div>
      </div>
      <PqrsStatusBadge :estado="pqrs.estado" />
    </div>

    <!-- Descripción -->
    <p class="text-sm text-gray-500 line-clamp-2">{{ pqrs.descripcion }}</p>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-1">
      <div class="flex items-center gap-2">
        <span :class="['rounded-full px-2 py-0.5 text-xs', prioridadBadgeClass(pqrs.prioridad)]">
          {{ pqrs.prioridad }}
        </span>
        <span v-if="pqrs.categoria" class="text-xs text-gray-400 capitalize">
          {{ pqrs.categoria }}
        </span>
      </div>
      <time class="text-xs text-gray-400">{{ formatDateTime(pqrs.fecha_radicacion) }}</time>
    </div>

    <!-- Responsable -->
    <div v-if="pqrs.responsable_asignado_nombre" class="flex items-center gap-1.5 pt-1 border-t border-gray-100">
      <div class="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
        {{ pqrs.responsable_asignado_nombre[0] }}
      </div>
      <span class="text-xs text-gray-500">{{ pqrs.responsable_asignado_nombre }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pqrs } from '../types/pqrs.types'
import { tipoIcon, prioridadBadgeClass, formatDateTime } from '../composables/usePqrs'
import PqrsStatusBadge from './PqrsStatusBadge.vue'

defineProps<{ pqrs: Pqrs }>()
const emit = defineEmits<{ (e: 'select', p: Pqrs): void }>()
</script>