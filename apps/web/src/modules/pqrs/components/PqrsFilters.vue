<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <select
          v-model="local.tipo"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
        >
          <option value="">Todos</option>
          <option v-for="t in TIPOS_PQRS" :key="t.value" :value="t.value">
            {{ t.icon }} {{ t.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select
          v-model="local.estado"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
        >
          <option v-for="e in ESTADOS_PQRS" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
        <select
          v-model="local.prioridad"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
        >
          <option v-for="p in PRIORIDADES_PQRS" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
        <select
          v-model="local.categoria"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          @change="emit('change', local)"
        >
          <option v-for="c in CATEGORIAS_PQRS" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <button
          class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          @click="emit('apply', local)"
        >
          Aplicar
        </button>
        <button
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          @click="reset"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="mt-3">
      <input
        v-model="local.numeroRadicado"
        type="text"
        placeholder="Buscar por N° radicado..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        @keyup.enter="emit('apply', local)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { TIPOS_PQRS, ESTADOS_PQRS, PRIORIDADES_PQRS, CATEGORIAS_PQRS } from '../composables/usePqrs'
import type { PqrsFilters } from '../types/pqrs.types'

const props = defineProps<{ modelValue?: PqrsFilters }>()
const emit  = defineEmits<{
  (e: 'change', f: PqrsFilters): void
  (e: 'apply',  f: PqrsFilters): void
}>()

const local = reactive<PqrsFilters>({
  tipo:           props.modelValue?.tipo           ?? '',
  estado:         props.modelValue?.estado         ?? '',
  prioridad:      props.modelValue?.prioridad      ?? '',
  categoria:      props.modelValue?.categoria      ?? '',
  numeroRadicado: props.modelValue?.numeroRadicado ?? '',
})

function reset() {
  local.tipo = ''; local.estado = ''; local.prioridad = ''
  local.categoria = ''; local.numeroRadicado = ''
  emit('apply', local)
}
</script>