<template>
  <div
    class="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer overflow-hidden"
    @click="emit('click')"
  >
    <!-- Color strip by estado -->
    <div :class="['h-1 w-full', stripClass]" />

    <div class="p-5 space-y-4">
      <!-- Header: tipo icon + asunto + estado badge -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl', iconBgClass]">
            {{ tipoIcon(asamblea.tipo) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{{ asamblea.asunto }}</p>
            <p class="text-xs text-gray-400 font-mono mt-0.5">{{ asamblea.numero_acta }}</p>
          </div>
        </div>
        <span :class="['inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', estadoBadgeClass(asamblea.estado)]">
          <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(asamblea.estado)]" />
          {{ estadoLabelText }}
        </span>
      </div>

      <!-- Info rows -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="capitalize text-xs">{{ formatDateTime(asamblea.fecha_programada) }}</span>
        </div>
        <div v-if="asamblea.lugar" class="flex items-center gap-2 text-xs text-gray-500">
          <svg class="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="truncate">{{ asamblea.lugar }}</span>
        </div>
      </div>

      <!-- Footer: tipo + quórum + asistentes -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <span class="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200">
          {{ tipoLabel(asamblea.tipo) }}
        </span>
        <div class="flex items-center gap-3">
          <div v-if="asamblea.asistentes_presente" class="flex items-center gap-1 text-xs text-gray-500">
            <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ asamblea.asistentes_presente }}
          </div>
          <div v-if="asamblea.quorum_requerido" class="text-xs text-gray-500">
            Quórum {{ asamblea.quorum_requerido }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Días restantes banner (programada) -->
    <div
      v-if="asamblea.estado === 'programada' && diasRestantes !== null"
      :class="['px-5 py-2.5 text-xs font-semibold text-center',
               diasRestantes <= 0  ? 'bg-red-50 text-red-700' :
               diasRestantes <= 3  ? 'bg-orange-50 text-orange-700' :
               diasRestantes <= 7  ? 'bg-yellow-50 text-yellow-700' : 'bg-indigo-50 text-indigo-600']"
    >
      {{ diasRestantes <= 0 ? '¡Fecha pasada — revisar!' : diasRestantes === 0 ? '¡Hoy es la asamblea!' : `⏱ Faltan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}` }}
    </div>

    <!-- En curso banner -->
    <div
      v-if="asamblea.estado === 'en_curso'"
      class="px-5 py-2.5 text-xs font-semibold text-center bg-green-500 text-white flex items-center justify-center gap-1.5"
    >
      <span class="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
      En curso ahora
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Asamblea } from '../types/asambleas.types'
import {
  tipoIcon, tipoLabel,
  estadoBadgeClass, estadoDotClass, estadoLabel,
  formatDateTime, diasParaAsamblea,
} from '../composables/useAsambleas'

const props = defineProps<{ asamblea: Asamblea }>()
const emit  = defineEmits<{ (e: 'click'): void }>()

const estadoLabelText = computed(() => estadoLabel(props.asamblea.estado))
const diasRestantes   = computed(() =>
  props.asamblea.estado === 'programada' ? diasParaAsamblea(props.asamblea.fecha_programada) : null
)

const stripClass = computed(() => {
  const map: Record<string, string> = {
    programada: 'bg-blue-400',
    en_curso:   'bg-green-500',
    realizada:  'bg-gray-300',
    cancelada:  'bg-red-400',
    pospuesta:  'bg-yellow-400',
  }
  return map[props.asamblea.estado] ?? 'bg-gray-200'
})

const iconBgClass = computed(() => {
  const map: Record<string, string> = {
    programada: 'bg-blue-50',
    en_curso:   'bg-green-50',
    realizada:  'bg-gray-50',
    cancelada:  'bg-red-50',
    pospuesta:  'bg-yellow-50',
  }
  return map[props.asamblea.estado] ?? 'bg-gray-50'
})
</script>
