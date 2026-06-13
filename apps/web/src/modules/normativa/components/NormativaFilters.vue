<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="sm:col-span-2 lg:col-span-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="local.search" type="text" placeholder="Título, número..."
            class="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            @keydown.enter="apply" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <select v-model="local.tipo" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
          <option value="">Todos los tipos</option>
          <option v-for="t in TIPOS_DOCUMENTO" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select v-model="local.estado" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
          <option v-for="e in ESTADOS_DOCUMENTO" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Categoría legal</label>
        <select v-model="local.categoria_legal" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
          <option v-for="c in CATEGORIAS_LEGALES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </div>
      <div class="flex items-end gap-2">
        <button class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors" @click="apply">Aplicar</button>
        <button class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" @click="reset">✕</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { TIPOS_DOCUMENTO, ESTADOS_DOCUMENTO, CATEGORIAS_LEGALES } from '../composables/useNormativa'
import type { NormativaFilters } from '../types/normativa.types'
const props = defineProps<{ modelValue: NormativaFilters }>()
const emit  = defineEmits<{
  (e: 'update:modelValue', v: NormativaFilters): void
  (e: 'apply', v: NormativaFilters): void
  (e: 'reset'): void
}>()
const local = reactive<NormativaFilters>({
  search: props.modelValue.search ?? '', tipo: props.modelValue.tipo ?? '',
  estado: props.modelValue.estado ?? '', categoria_legal: props.modelValue.categoria_legal ?? '',
})
function apply() { emit('update:modelValue', { ...local }); emit('apply', { ...local }) }
function reset() {
  local.search = ''; local.tipo = ''; local.estado = ''; local.categoria_legal = ''
  emit('update:modelValue', { ...local }); emit('reset')
}
</script>