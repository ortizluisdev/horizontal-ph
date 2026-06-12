<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="text-base font-semibold text-gray-900">{{ conjunto.nombre }}</h3>
        <p class="text-sm text-gray-500">{{ conjunto.direccion }}</p>
        <p v-if="conjunto.ciudad" class="text-sm text-gray-400">{{ conjunto.ciudad }}</p>
      </div>
      <span :class="badgeClass" class="text-xs font-medium px-2.5 py-1 rounded-full capitalize">
        {{ conjunto.tipo_conjunto ?? 'Sin tipo' }}
      </span>
    </div>

    <div class="flex items-center gap-2 mt-4">
      <span
        :class="conjunto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
        class="text-xs font-medium px-2 py-0.5 rounded-full"
      >
        {{ conjunto.activo ? 'Activo' : 'Inactivo' }}
      </span>
      <span class="text-xs text-gray-400 ml-auto">
        Creado {{ formatDate(conjunto.created_at) }}
      </span>
    </div>

    <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
      <router-link
        :to="`/conjuntos/${conjunto.id}`"
        class="flex-1 text-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        Ver detalle
      </router-link>
      <router-link
        :to="`/conjuntos/${conjunto.id}/editar`"
        class="flex-1 text-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
      >
        Editar
      </router-link>
      <button
        @click="$emit('eliminar', conjunto.id)"
        class="flex-1 text-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
      >
        Eliminar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Conjunto } from '../types/conjuntos.types'

const props = defineProps<{ conjunto: Conjunto }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()

const badgeClass = computed(() => {
  const map: Record<string, string> = {
    residencial: 'bg-blue-100 text-blue-700',
    comercial: 'bg-purple-100 text-purple-700',
    mixto: 'bg-yellow-100 text-yellow-700',
    industrial: 'bg-gray-100 text-gray-700',
    otro: 'bg-gray-100 text-gray-500',
  }
  return map[props.conjunto.tipo_conjunto ?? ''] ?? 'bg-gray-100 text-gray-500'
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' })
}
</script>