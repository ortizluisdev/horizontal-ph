<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Piso</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Coef.</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Activa</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!unidades.length">
          <td colspan="8" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <span class="text-4xl">🏠</span>
              <p class="text-sm font-medium">No hay unidades registradas</p>
            </div>
          </td>
        </tr>
        <tr
          v-for="u in unidades"
          :key="u.id"
          class="hover:bg-blue-50/30 transition-colors"
        >
          <td class="px-4 py-3 font-semibold text-gray-900">{{ u.nombre }}</td>
          <td class="px-4 py-3 capitalize text-gray-600">{{ u.tipo }}</td>
          <td class="px-4 py-3 text-gray-500">{{ u.piso ?? '—' }}</td>
          <td class="px-4 py-3 text-gray-500">{{ u.area_m2 ? `${u.area_m2} m²` : '—' }}</td>
          <td class="px-4 py-3 text-gray-500">{{ u.coeficiente ? `${u.coeficiente}%` : '—' }}</td>
          <td class="px-4 py-3">
            <span :class="estadoClass(u.estado)" class="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
              {{ u.estado.replace('_', ' ') }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span
              :class="u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {{ u.activo ? 'Sí' : 'No' }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-1">
              <router-link
                :to="`/unidades/${u.id}`"
                class="px-2.5 py-1 rounded-md text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Ver
              </router-link>
              <router-link
                :to="`/unidades/${u.id}/editar`"
                class="px-2.5 py-1 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Editar
              </router-link>
              <button
                @click="$emit('eliminar', u.id)"
                class="px-2.5 py-1 rounded-md text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Unidad, EstadoUnidad } from '../types/unidades.types'

defineProps<{ unidades: Unidad[] }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()

function estadoClass(estado: EstadoUnidad) {
  return {
    ocupado:    'bg-green-100 text-green-700',
    desocupado: 'bg-gray-100 text-gray-600',
    en_mora:    'bg-red-100 text-red-700',
    bloqueado:  'bg-yellow-100 text-yellow-700',
  }[estado] ?? 'bg-gray-100 text-gray-600'
}
</script>