<template>
  <div
    class="group bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer space-y-4"
    @click="emit('select', doc)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {{ tipoIcon(doc.tipo) }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ doc.titulo }}</p>
          <p v-if="doc.numero_documento" class="text-xs text-gray-400 font-mono mt-0.5">
            {{ doc.numero_documento }}<span v-if="doc.version" class="ml-1 text-gray-300">· v{{ doc.version }}</span>
          </p>
        </div>
      </div>
      <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0', estadoBadgeClass(doc.estado)]">
        <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(doc.estado)]" />
        {{ estadoLabel }}
      </span>
    </div>
    <p v-if="doc.descripcion" class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ doc.descripcion }}</p>
    <div class="space-y-1.5 text-sm">
      <div class="flex items-center gap-2 text-gray-600">
        <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">Emitido: {{ formatDate(doc.fecha_emision) }}</span>
      </div>
      <div v-if="doc.fecha_vigencia_hasta" class="flex items-center gap-2">
        <svg :class="['h-4 w-4 shrink-0', diasVencer !== null && diasVencer <= 30 ? 'text-yellow-500' : 'text-gray-400']"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span :class="['text-xs', diasVencer !== null && diasVencer <= 30 ? 'text-yellow-700 font-medium' : 'text-gray-500']">
          Vence: {{ formatDate(doc.fecha_vigencia_hasta) }}
        </span>
      </div>
    </div>
    <div class="flex items-center justify-between pt-1 border-t border-gray-100">
      <span class="text-xs text-gray-400">{{ categoriaLabel(doc.categoria_legal) }}</span>
      <div class="flex items-center gap-2">
        <span v-if="doc.archivo_url" class="flex items-center gap-1 text-xs text-indigo-600 font-medium">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {{ doc.archivo_nombre ?? 'Adjunto' }}
        </span>
        <span class="text-xs text-indigo-600 font-medium">{{ alcanceLabel(doc.alcance) }}</span>
      </div>
    </div>
    <div
      v-if="diasVencer !== null && diasVencer <= 30 && doc.estado === 'vigente'"
      :class="['rounded-lg px-3 py-2 text-xs font-medium text-center', diasVencer <= 7 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700']"
    >
      {{ diasVencer <= 0 ? 'Documento vencido' : `Vence en ${diasVencer} día(s)` }}
    </div>
    <div v-if="doc.tags?.length" class="flex flex-wrap gap-1">
      <span v-for="tag in doc.tags.slice(0, 4)" :key="tag" class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">#{{ tag }}</span>
      <span v-if="doc.tags.length > 4" class="text-xs text-gray-400">+{{ doc.tags.length - 4 }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Normativa } from '../types/normativa.types'
import { tipoIcon, estadoBadgeClass, estadoDotClass, formatDate, categoriaLabel, alcanceLabel, diasParaVencer, ESTADOS_DOCUMENTO } from '../composables/useNormativa'
const props = defineProps<{ doc: Normativa }>()
const emit  = defineEmits<{ (e: 'select', d: Normativa): void }>()
const estadoLabel = computed(() => ESTADOS_DOCUMENTO.find((e) => e.value === props.doc.estado)?.label ?? props.doc.estado)
const diasVencer  = computed(() => props.doc.fecha_vigencia_hasta ? diasParaVencer(props.doc.fecha_vigencia_hasta) : null)
</script>