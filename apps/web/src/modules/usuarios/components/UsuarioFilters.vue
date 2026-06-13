<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Buscar -->
      <div class="sm:col-span-2 lg:col-span-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="local.search" type="text" placeholder="Nombre, correo..."
            class="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            @keydown.enter="apply" />
        </div>
      </div>
      <!-- Tipo -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <select v-model="local.tipo_usuario"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
          <option value="">Todos los tipos</option>
          <option v-for="t in TIPOS_USUARIO" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
        </select>
      </div>
      <!-- Estado -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select v-model="local.estado"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
          <option v-for="e in ESTADOS_USUARIO" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </div>
      <!-- Botones -->
      <div class="flex items-end gap-2">
        <button
          class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          @click="apply">Aplicar</button>
        <button
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          @click="reset">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { TIPOS_USUARIO, ESTADOS_USUARIO } from '../composables/useUsuarios'
import type { UsuarioFilters } from '../types/usuarios.types'

const props = defineProps<{ modelValue: UsuarioFilters }>()
const emit  = defineEmits<{
  (e: 'update:modelValue', v: UsuarioFilters): void
  (e: 'apply', v: UsuarioFilters): void
  (e: 'reset'): void
}>()

const local = reactive<UsuarioFilters>({
  search:       props.modelValue.search       ?? '',
  tipo_usuario: props.modelValue.tipo_usuario ?? '',
  estado:       props.modelValue.estado       ?? '',
})

function apply() {
  emit('update:modelValue', { ...local })
  emit('apply', { ...local })
}

function reset() {
  local.search = ''; local.tipo_usuario = ''; local.estado = ''
  emit('update:modelValue', { ...local })
  emit('reset')
}
</script>