<template>
  <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
      <div class="flex items-center gap-3">
        <span class="text-lg">{{ tipoIcon(doc.tipo) }}</span>
        <div>
          <p class="text-sm font-semibold text-gray-900">{{ doc.titulo }}</p>
          <p v-if="doc.numero_documento" class="text-xs font-mono text-gray-400">{{ doc.numero_documento }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a v-if="doc.archivo_url" :href="doc.archivo_url" target="_blank"
          class="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white transition-colors">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ doc.archivo_nombre ?? 'Descargar' }}
          <span v-if="doc.archivo_tamano" class="text-gray-400">({{ formatTamano(doc.archivo_tamano) }})</span>
        </a>
        <div v-if="doc.contenido && doc.archivo_url" class="flex rounded-lg border border-gray-300 overflow-hidden">
          <button :class="['px-3 py-1.5 text-xs font-medium transition-colors', vista === 'texto' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50']" @click="vista = 'texto'">Texto</button>
          <button :class="['px-3 py-1.5 text-xs font-medium transition-colors', vista === 'pdf'   ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50']" @click="vista = 'pdf'">PDF</button>
        </div>
      </div>
    </div>
    <div v-if="(vista === 'texto' || !doc.archivo_url) && doc.contenido" class="p-6">
      <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{{ doc.contenido }}</div>
    </div>
    <div v-else-if="vista === 'pdf' && doc.archivo_url">
      <iframe :src="`${doc.archivo_url}#toolbar=1`" class="w-full border-0" style="height:70vh" title="Visor de documento" />
    </div>
    <div v-else class="flex flex-col items-center py-16 text-gray-400">
      <span class="text-4xl mb-3">📄</span>
      <p class="text-sm">Este documento no tiene contenido en línea</p>
    </div>
    <div class="border-t border-gray-100 px-5 py-3.5 bg-gray-50">
      <div class="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-500">
        <span v-if="doc.aprobado_por">✅ Aprobado por: <strong class="text-gray-700">{{ doc.aprobado_por }}</strong></span>
        <span>📅 Emitido: <strong class="text-gray-700">{{ formatDate(doc.fecha_emision) }}</strong></span>
        <span v-if="doc.fecha_vigencia_desde">▶ Desde: <strong class="text-gray-700">{{ formatDate(doc.fecha_vigencia_desde) }}</strong></span>
        <span v-if="doc.fecha_vigencia_hasta">⏹ Hasta: <strong :class="vencimientoClass">{{ formatDate(doc.fecha_vigencia_hasta) }}</strong></span>
        <span>👥 Alcance: <strong class="text-gray-700">{{ alcanceLabel(doc.alcance) }}</strong></span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Normativa } from '../types/normativa.types'
import { tipoIcon, formatDate, formatTamano, alcanceLabel, diasParaVencer } from '../composables/useNormativa'
const props = defineProps<{ doc: Normativa }>()
const vista = ref<'texto' | 'pdf'>(props.doc.contenido ? 'texto' : 'pdf')
const vencimientoClass = computed(() => {
  if (!props.doc.fecha_vigencia_hasta) return 'text-gray-700'
  const dias = diasParaVencer(props.doc.fecha_vigencia_hasta)
  if (dias < 0)   return 'text-red-600'
  if (dias <= 30) return 'text-yellow-600'
  return 'text-gray-700'
})
</script>