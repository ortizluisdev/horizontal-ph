<template>
  <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">Historial de seguimiento</h3>
    </div>

    <div v-if="!items.length" class="flex flex-col items-center py-10 text-gray-400">
      <span class="text-3xl mb-2">🕐</span>
      <p class="text-sm">Sin movimientos registrados</p>
    </div>

    <div v-else class="p-5">
      <ol class="relative border-l border-gray-200 space-y-6 ml-3">
        <li v-for="(evt, idx) in items" :key="evt.id" class="ml-6">
          <!-- Dot -->
          <span
            :class="['absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white text-xs',
                     idx === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500']"
          >
            {{ idx === 0 ? '●' : '○' }}
          </span>

          <div class="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900">{{ evt.accion }}</p>
              <time class="text-xs text-gray-400 whitespace-nowrap">{{ formatDateTime(evt.fecha_cambio) }}</time>
            </div>

            <div v-if="evt.estado_anterior || evt.estado_nuevo" class="flex items-center gap-2 text-xs">
              <span v-if="evt.estado_anterior" class="rounded bg-gray-200 px-1.5 py-0.5 text-gray-600 capitalize">
                {{ evt.estado_anterior }}
              </span>
              <span v-if="evt.estado_anterior && evt.estado_nuevo" class="text-gray-400">→</span>
              <span v-if="evt.estado_nuevo" class="rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-700 capitalize">
                {{ evt.estado_nuevo }}
              </span>
            </div>

            <p v-if="evt.descripcion" class="text-xs text-gray-500">{{ evt.descripcion }}</p>

            <p class="text-xs text-gray-400">
              Por: <span class="font-medium text-gray-600">{{ evt.usuario_nombre }}</span>
            </p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PqrsSeguimiento } from '../types/pqrs.types'
import { formatDateTime } from '../composables/usePqrs'

defineProps<{ items: PqrsSeguimiento[] }>()
</script>