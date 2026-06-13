<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div v-if="!items.length" class="flex flex-col items-center py-16 text-gray-400">
      <span class="text-4xl mb-3">📂</span>
      <p class="text-sm">No hay documentos registrados</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3 text-left">Tipo</th>
            <th class="px-5 py-3 text-left">Título / Número</th>
            <th class="px-5 py-3 text-left">Categoría</th>
            <th class="px-5 py-3 text-left">Emisión</th>
            <th class="px-5 py-3 text-left">Vigencia</th>
            <th class="px-5 py-3 text-center">Estado</th>
            <th class="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="doc in items" :key="doc.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer" @click="emit('select', doc)">
            <td class="px-5 py-3.5 text-lg">{{ tipoIcon(doc.tipo) }}</td>
            <td class="px-5 py-3.5 max-w-xs">
              <p class="font-medium text-gray-900 truncate">{{ doc.titulo }}</p>
              <p v-if="doc.numero_documento" class="text-xs font-mono text-gray-400 mt-0.5">
                {{ doc.numero_documento }}<span v-if="doc.version" class="ml-1 text-gray-300">v{{ doc.version }}</span>
              </p>
            </td>
            <td class="px-5 py-3.5"><span class="text-xs text-gray-600">{{ categoriaLabel(doc.categoria_legal) }}</span></td>
            <td class="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{{ formatDateShort(doc.fecha_emision) }}</td>
            <td class="px-5 py-3.5 text-xs whitespace-nowrap">
              <span v-if="doc.fecha_vigencia_hasta" :class="vencimientoClass(doc)">{{ formatDateShort(doc.fecha_vigencia_hasta) }}</span>
              <span v-else class="text-gray-400">Indefinida</span>
            </td>
            <td class="px-5 py-3.5 text-center">
              <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(doc.estado)]">
                <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(doc.estado)]" />
                {{ ESTADOS_DOCUMENTO.find((e) => e.value === doc.estado)?.label }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <a v-if="doc.archivo_url" :href="doc.archivo_url" target="_blank"
                  class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button v-if="showAdmin && ['vigente','en_revision','borrador'].includes(doc.estado)"
                  class="rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors"
                  @click="emit('derogar', doc)">Derogar</button>
                <button class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" @click="emit('select', doc)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="pages > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p class="text-xs text-gray-500">Página {{ page }} de {{ pages }} · {{ total }} documentos</p>
      <div class="flex gap-1">
        <button :disabled="page === 1" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" @click="emit('page', page - 1)">Anterior</button>
        <button :disabled="page === pages" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" @click="emit('page', page + 1)">Siguiente</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Normativa } from '../types/normativa.types'
import { tipoIcon, estadoBadgeClass, estadoDotClass, formatDateShort, categoriaLabel, diasParaVencer, ESTADOS_DOCUMENTO } from '../composables/useNormativa'
defineProps<{ items: Normativa[]; page: number; pages: number; total: number; showAdmin?: boolean }>()
const emit = defineEmits<{
  (e: 'select', d: Normativa): void
  (e: 'derogar', d: Normativa): void
  (e: 'page', p: number): void
}>()
function vencimientoClass(doc: Normativa): string {
  if (!doc.fecha_vigencia_hasta || doc.estado !== 'vigente') return 'text-gray-500'
  const dias = diasParaVencer(doc.fecha_vigencia_hasta)
  if (dias < 0)   return 'text-red-600 font-semibold'
  if (dias <= 7)  return 'text-red-500 font-medium'
  if (dias <= 30) return 'text-yellow-600 font-medium'
  return 'text-gray-600'
}
</script>