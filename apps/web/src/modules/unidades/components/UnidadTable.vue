<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Número</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Piso</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Área</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Conjunto</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Activa</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!unidades.length">
          <td colspan="8" class="px-4 py-16 text-center">
            <div class="flex flex-col items-center gap-3 text-gray-400">
              <svg class="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <p class="text-sm font-medium">No hay unidades registradas</p>
              <p class="text-xs">Crea la primera unidad con el botón de arriba</p>
            </div>
          </td>
        </tr>
        <tr
          v-for="u in unidades"
          :key="u.id"
          class="hover:bg-blue-50/30 transition-colors"
        >
          <td class="px-4 py-3">
            <p class="font-semibold text-gray-900">{{ u.nombre }}</p>
            <p v-if="u.descripcion" class="text-xs text-gray-400 truncate max-w-[180px]">{{ u.descripcion }}</p>
          </td>
          <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">
            {{ u.numero_unidad ?? '—' }}
          </td>
          <td class="px-4 py-3 text-gray-600">
            {{ u.tipo_unidad ? TIPO_UNIDAD_LABELS[u.tipo_unidad] : '—' }}
          </td>
          <td class="px-4 py-3 text-gray-500 hidden md:table-cell">{{ u.piso ?? '—' }}</td>
          <td class="px-4 py-3 text-gray-500 hidden md:table-cell">
            {{ u.area_m2 ? `${u.area_m2} m²` : '—' }}
          </td>
          <td class="px-4 py-3 text-gray-500 hidden lg:table-cell">
            {{ u.conjunto_nombre ?? '—' }}
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
                @click="$emit('desactivar', u.id)"
                class="px-2.5 py-1 rounded-md text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
              >
                {{ u.activo ? 'Desactivar' : 'Activar' }}
              </button>
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
import type { Unidad } from '../types/unidades.types'
import { TIPO_UNIDAD_LABELS } from '../types/unidades.types'

defineProps<{ unidades: Unidad[] }>()
defineEmits<{
  (e: 'eliminar', id: string): void
  (e: 'desactivar', id: string): void
}>()
</script>