<template>
  <div
    class="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer overflow-hidden"
    @click="emit('select', doc)"
  >
    <!-- Franja de estado superior -->
    <div :class="['h-1 w-full', stripClass]" />

    <div class="p-5 space-y-4">

      <!-- Header: icono + título + badge estado -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl', iconBgClass]">
            {{ tipoIcon(doc.tipo) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{{ doc.titulo }}</p>
            <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <p v-if="doc.numero_documento" class="text-xs text-gray-400 font-mono">{{ doc.numero_documento }}</p>
              <span v-if="doc.version" class="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">v{{ doc.version }}</span>
            </div>
          </div>
        </div>
        <span :class="['inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', estadoBadgeClass(doc.estado)]">
          <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(doc.estado)]" />
          {{ estadoLabel(doc.estado) }}
        </span>
      </div>

      <!-- Descripción -->
      <p v-if="doc.descripcion" class="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {{ doc.descripcion }}
      </p>

      <!-- Fechas -->
      <div class="space-y-1.5">
        <div v-if="doc.fecha_emision" class="flex items-center gap-2 text-xs text-gray-500">
          <svg class="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Emitido {{ formatDateShort(doc.fecha_emision) }}</span>
        </div>
        <div v-if="doc.fecha_vigencia_hasta" class="flex items-center gap-2 text-xs">
          <svg :class="['h-3.5 w-3.5 shrink-0', diasVencer !== null && diasVencer <= 30 ? 'text-yellow-500' : 'text-gray-400']"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span :class="diasVencer !== null && diasVencer <= 30 ? 'text-yellow-700 font-medium' : 'text-gray-500'">
            Vence {{ formatDateShort(doc.fecha_vigencia_hasta) }}
          </span>
        </div>
      </div>

      <!-- Footer: categoría + adjunto -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <span v-if="doc.categoria_legal" class="text-xs text-gray-400 truncate max-w-[140px]">
          {{ categoriaLabel(doc.categoria_legal) }}
        </span>
        <span v-else class="text-xs text-gray-300">{{ tipoLabel(doc.tipo) }}</span>
        <div class="flex items-center gap-2 shrink-0">
          <span v-if="doc.archivo_url" class="flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            PDF
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="doc.tags?.length" class="flex flex-wrap gap-1">
        <span
          v-for="tag in doc.tags.slice(0, 3)"
          :key="tag"
          class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
        >#{{ tag }}</span>
        <span v-if="doc.tags.length > 3" class="text-xs text-gray-400">+{{ doc.tags.length - 3 }}</span>
      </div>
    </div>

    <!-- Banner alerta vencimiento -->
    <div
      v-if="diasVencer !== null && diasVencer <= 30 && doc.estado === 'vigente'"
      :class="['px-5 py-2 text-xs font-semibold text-center',
               diasVencer <= 0  ? 'bg-red-50 text-red-700' :
               diasVencer <= 7  ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700']"
    >
      {{ diasVencer <= 0 ? '¡Documento vencido!' : `⏱ Vence en ${diasVencer} día${diasVencer !== 1 ? 's' : ''}` }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Normativa } from '../types/normativa.types'
import {
  tipoIcon, tipoLabel, estadoBadgeClass, estadoDotClass, estadoLabel,
  estadoStripClass, categoriaLabel, formatDateShort, diasParaVencer,
} from '../composables/useNormativa'

const props = defineProps<{ doc: Normativa }>()
const emit  = defineEmits<{ (e: 'select', d: Normativa): void }>()

const diasVencer = computed(() => diasParaVencer(props.doc.fecha_vigencia_hasta))

const stripClass = computed(() => estadoStripClass(props.doc.estado))

const iconBgClass = computed(() => {
  const map: Record<string, string> = {
    vigente:     'bg-green-50',
    en_revision: 'bg-yellow-50',
    borrador:    'bg-blue-50',
    derogado:    'bg-red-50',
    archivado:   'bg-gray-50',
  }
  return map[props.doc.estado] ?? 'bg-indigo-50'
})
</script>
