<template>
  <div class="space-y-5">
    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>
    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
    <div v-else-if="!doc" class="text-center py-20 text-gray-400"><p class="text-sm">Documento no encontrado</p></div>
    <template v-else>
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shrink-0">{{ tipoIcon(doc.tipo) }}</div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ doc.titulo }}</h1>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <p v-if="doc.numero_documento" class="text-sm font-mono text-gray-400">{{ doc.numero_documento }}</p>
              <span v-if="doc.version" class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">v{{ doc.version }}</span>
              <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 font-medium">{{ categoriaLabel(doc.categoria_legal) }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset', estadoBadgeClass(doc.estado)]">
            <span :class="['h-2 w-2 rounded-full', estadoDotClass(doc.estado)]" />
            {{ ESTADOS_DOCUMENTO.find((e) => e.value === doc.estado)?.label }}
          </span>
          <button v-if="authStore.isAdmin"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="router.push(`/normativa/${doc.id}/editar`)">Editar</button>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 space-y-4">
          <div v-if="doc.descripcion" class="rounded-xl border border-gray-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Descripción</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ doc.descripcion }}</p>
          </div>
          <DocumentoViewer :doc="doc" />
          <div v-if="doc.tags?.length" class="flex flex-wrap gap-2">
            <span v-for="tag in doc.tags" :key="tag" class="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 font-medium">#{{ tag }}</span>
          </div>
        </div>
        <div class="space-y-4">
          <div class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            <div v-for="row in infoRows" :key="row.label" class="flex items-center justify-between px-5 py-3.5 text-sm">
              <span class="text-gray-500">{{ row.label }}</span>
              <span class="font-medium text-gray-900 text-right text-xs">{{ row.value }}</span>
            </div>
          </div>
          <div v-if="doc.fecha_vigencia_hasta" class="rounded-xl border border-gray-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Vigencia</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-gray-500">
                <span>{{ formatDate(doc.fecha_vigencia_desde ?? doc.fecha_emision) }}</span>
                <span>{{ formatDate(doc.fecha_vigencia_hasta) }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div :class="['h-2 rounded-full transition-all', vigenciaBarClass]" :style="{ width: `${vigenciaPct}%` }" />
              </div>
              <p :class="['text-xs text-center font-medium', vigenciaMsgClass]">{{ vigenciaMsg }}</p>
            </div>
          </div>
          <div v-if="authStore.isAdmin" class="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Gestión</h3>
            <button v-if="doc.estado === 'borrador'"
              class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              @click="handleEstado('en_revision')">📋 Enviar a revisión</button>
            <button v-if="doc.estado === 'en_revision'"
              class="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
              @click="handleEstado('vigente')">✅ Aprobar y publicar</button>
            <button v-if="['en_revision','borrador'].includes(doc.estado)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              @click="handleEstado('borrador')">↩ Volver a borrador</button>
            <button v-if="doc.estado === 'vigente'"
              class="w-full rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
              @click="handleEstado('derogado')">⚖️ Derogar documento</button>
            <button v-if="['borrador','derogado','archivado'].includes(doc.estado)"
              class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
              @click="handleEliminar">🗑 Eliminar</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNormativaStore } from '../store/normativa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { tipoIcon, estadoBadgeClass, estadoDotClass, formatDate, categoriaLabel, alcanceLabel, ESTADOS_DOCUMENTO, diasParaVencer } from '../composables/useNormativa'
import DocumentoViewer from '../components/DocumentoViewer.vue'
import type { EstadoDocumento } from '../types/normativa.types'
const route     = useRoute()
const router    = useRouter()
const store     = useNormativaStore()
const authStore = useAuthStore()
const doc = computed(() => store.current)
onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())
const infoRows = computed(() => {
  if (!doc.value) return []
  return [
    { label: 'Tipo',       value: doc.value.tipo },
    { label: 'Alcance',    value: alcanceLabel(doc.value.alcance) },
    { label: 'Aprobado',   value: doc.value.aprobado_por ?? '-' },
    { label: 'Emitido',    value: formatDate(doc.value.fecha_emision) },
    { label: 'Registrado', value: new Date(doc.value.created_at).toLocaleDateString('es-CO') },
  ]
})
const vigenciaPct = computed(() => {
  if (!doc.value?.fecha_vigencia_hasta) return 100
  const inicio = new Date(doc.value.fecha_vigencia_desde ?? doc.value.fecha_emision).getTime()
  const fin    = new Date(doc.value.fecha_vigencia_hasta).getTime()
  const ahora  = Date.now()
  if (ahora >= fin)    return 100
  if (ahora <= inicio) return 0
  return Math.round(((ahora - inicio) / (fin - inicio)) * 100)
})
const vigenciaBarClass  = computed(() => vigenciaPct.value >= 90 ? 'bg-red-500' : vigenciaPct.value >= 70 ? 'bg-yellow-500' : 'bg-green-500')
const vigenciaMsg       = computed(() => {
  if (!doc.value?.fecha_vigencia_hasta) return 'Vigencia indefinida'
  const dias = diasParaVencer(doc.value.fecha_vigencia_hasta)
  if (dias < 0)   return 'Documento vencido'
  if (dias === 0) return '¡Vence hoy!'
  return `Vence en ${dias} día(s)`
})
const vigenciaMsgClass  = computed(() => {
  if (!doc.value?.fecha_vigencia_hasta) return 'text-gray-500'
  const dias = diasParaVencer(doc.value.fecha_vigencia_hasta)
  if (dias < 0)   return 'text-red-600'
  if (dias <= 30) return 'text-yellow-600'
  return 'text-green-600'
})
async function handleEstado(estado: EstadoDocumento) {
  const labels: Record<EstadoDocumento, string> = {
    vigente: 'aprobar y publicar', en_revision: 'enviar a revisión',
    borrador: 'volver a borrador', derogado: 'derogar', archivado: 'archivar',
  }
  if (confirm(`¿${labels[estado]} este documento?`)) await store.cambiarEstado(doc.value!.id, estado)
}
async function handleEliminar() {
  if (confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) {
    await store.remove(doc.value!.id)
    router.push('/normativa')
  }
}
</script>