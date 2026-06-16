<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0 pr-3">
        <h3 class="text-base font-semibold text-gray-900 truncate">{{ conjunto.nombre }}</h3>
        <p class="text-sm text-gray-500 truncate">{{ conjunto.direccion }}</p>
        <p v-if="conjunto.ciudad" class="text-sm text-gray-400">
          {{ conjunto.ciudad }}{{ conjunto.departamento ? `, ${conjunto.departamento}` : '' }}
        </p>
      </div>
      <span :class="tipoBadge" class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
        {{ TIPO_CONJUNTO_LABELS[conjunto.tipo_conjunto] ?? conjunto.tipo_conjunto }}
      </span>
    </div>

    <!-- Stats rápidas -->
    <div class="grid grid-cols-2 gap-2 my-3 text-xs text-gray-500">
      <div v-if="conjunto.numero_unidades" class="flex items-center gap-1">
        <span class="font-medium text-gray-700">{{ conjunto.numero_unidades }}</span> unidades
      </div>
      <div v-if="conjunto.numero_torres" class="flex items-center gap-1">
        <span class="font-medium text-gray-700">{{ conjunto.numero_torres }}</span> torres
      </div>
      <div v-if="conjunto.area_total_m2" class="flex items-center gap-1">
        <span class="font-medium text-gray-700">{{ conjunto.area_total_m2 }}</span> m²
      </div>
      <div v-if="conjunto.administrador_nombre" class="col-span-2 truncate">
        Admin: {{ conjunto.administrador_nombre }}
      </div>
    </div>

    <div class="flex items-center gap-2 mt-3">
      <span
        :class="conjunto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
        class="text-xs font-medium px-2 py-0.5 rounded-full"
      >
        {{ conjunto.activo ? 'Activo' : 'Inactivo' }}
      </span>
      <span class="text-xs text-gray-400 ml-auto">
        {{ formatDate(conjunto.created_at) }}
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
import type { Conjunto, TipoConjunto } from '../types/conjuntos.types'
import { TIPO_CONJUNTO_LABELS } from '../types/conjuntos.types'

const props = defineProps<{ conjunto: Conjunto }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()

const tipoBadgeMap: Record<TipoConjunto, string> = {
  edificio:   'bg-blue-100 text-blue-700',
  casa:       'bg-green-100 text-green-700',
  ciudadela:  'bg-purple-100 text-purple-700',
  condominio: 'bg-yellow-100 text-yellow-700',
  otro:       'bg-gray-100 text-gray-500',
}

const tipoBadge = computed(
  () => tipoBadgeMap[props.conjunto.tipo_conjunto] ?? 'bg-gray-100 text-gray-500'
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' })
}
</script>