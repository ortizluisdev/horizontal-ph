<template>
  <div
    class="group bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer space-y-4"
    @click="emit('select', asamblea)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {{ tipoIcon(asamblea.tipo) }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ asamblea.asunto }}</p>
          <p class="text-xs text-gray-400 font-mono mt-0.5">Acta {{ asamblea.numero_acta }}</p>
        </div>
      </div>
      <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0', estadoBadgeClass(asamblea.estado)]">
        <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(asamblea.estado)]" />
        {{ estadoLabel }}
      </span>
    </div>

    <!-- Info -->
    <div class="space-y-1.5 text-sm">
      <div class="flex items-center gap-2 text-gray-600">
        <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="capitalize">{{ formatDateTime(asamblea.fecha_programada) }}</span>
      </div>
      <div v-if="asamblea.lugar" class="flex items-center gap-2 text-gray-600">
        <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="truncate">{{ asamblea.lugar }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-1 border-t border-gray-100">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-400">Tipo:</span>
        <span class="text-xs font-medium text-indigo-600">{{ tipoLabel(asamblea.tipo) }}</span>
      </div>
      <div v-if="asamblea.quorum_requerido" class="flex items-center gap-1">
        <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
               M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
               m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-xs text-gray-500">Quórum {{ asamblea.quorum_requerido }}%</span>
      </div>
    </div>

    <!-- Días restantes (solo si está programada) -->
    <div v-if="asamblea.estado === 'programada' && diasRestantes !== null"
      :class="['rounded-lg px-3 py-2 text-xs font-medium text-center',
               diasRestantes <= 3 ? 'bg-red-50 text-red-700' :
               diasRestantes <= 7 ? 'bg-yellow-50 text-yellow-700' : 'bg-indigo-50 text-indigo-700']"
    >
      {{ diasRestantes > 0 ? `Faltan ${diasRestantes} día(s)` : diasRestantes === 0 ? '¡Hoy es la asamblea!' : 'Fecha pasada' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Asamblea } from '../types/asambleas.types'
import { tipoIcon, tipoLabel, estadoBadgeClass, estadoDotClass, formatDateTime, diasParaAsamblea, ESTADOS_ASAMBLEA } from '../composables/useAsambleas'

const props = defineProps<{ asamblea: Asamblea }>()
const emit  = defineEmits<{ (e: 'select', a: Asamblea): void }>()

const estadoLabel   = computed(() => ESTADOS_ASAMBLEA.find((e) => e.value === props.asamblea.estado)?.label ?? props.asamblea.estado)
const diasRestantes = computed(() => props.asamblea.estado === 'programada' ? diasParaAsamblea(props.asamblea.fecha_programada) : null)
</script>