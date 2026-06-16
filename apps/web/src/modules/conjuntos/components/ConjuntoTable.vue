<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ciudad</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Unidades</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!conjuntos.length">
          <td colspan="7" class="px-4 py-10 text-center text-gray-400 text-sm">
            No hay conjuntos registrados
          </td>
        </tr>
        <tr
          v-for="c in conjuntos"
          :key="c.id"
          class="hover:bg-gray-50 transition-colors"
        >
          <td class="px-4 py-3 font-medium text-gray-900">{{ c.nombre }}</td>
          <td class="px-4 py-3 text-gray-600 max-w-[180px] truncate" :title="c.direccion">
            {{ c.direccion }}
          </td>
          <td class="px-4 py-3 text-gray-500">{{ c.ciudad ?? '—' }}</td>
          <td class="px-4 py-3">
            <span :class="tipoBadge(c.tipo_conjunto)" class="text-xs font-medium px-2 py-0.5 rounded-full capitalize">
              {{ TIPO_CONJUNTO_LABELS[c.tipo_conjunto] ?? c.tipo_conjunto }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-500 text-center">
            {{ c.numero_unidades ?? '—' }}
          </td>
          <td class="px-4 py-3">
            <span
              :class="c.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {{ c.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex justify-end gap-3">
              <router-link
                :to="`/conjuntos/${c.id}`"
                class="text-blue-600 hover:underline text-xs font-medium"
              >
                Ver
              </router-link>
              <router-link
                :to="`/conjuntos/${c.id}/editar`"
                class="text-gray-600 hover:underline text-xs font-medium"
              >
                Editar
              </router-link>
              <button
                @click="$emit('eliminar', c.id)"
                class="text-red-500 hover:underline text-xs font-medium"
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
import type { Conjunto, TipoConjunto } from '../types/conjuntos.types'
import { TIPO_CONJUNTO_LABELS } from '../types/conjuntos.types'

defineProps<{ conjuntos: Conjunto[] }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()

const tipoBadgeMap: Record<TipoConjunto, string> = {
  edificio:   'bg-blue-100 text-blue-700',
  casa:       'bg-green-100 text-green-700',
  ciudadela:  'bg-purple-100 text-purple-700',
  condominio: 'bg-yellow-100 text-yellow-700',
  otro:       'bg-gray-100 text-gray-500',
}

function tipoBadge(tipo: TipoConjunto): string {
  return tipoBadgeMap[tipo] ?? 'bg-gray-100 text-gray-500'
}
</script>