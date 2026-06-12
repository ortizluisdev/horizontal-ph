<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ciudad</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!conjuntos.length">
          <td colspan="6" class="px-4 py-8 text-center text-gray-400">No hay conjuntos registrados</td>
        </tr>
        <tr
          v-for="c in conjuntos"
          :key="c.id"
          class="hover:bg-gray-50 transition-colors"
        >
          <td class="px-4 py-3 font-medium text-gray-900">{{ c.nombre }}</td>
          <td class="px-4 py-3 text-gray-600">{{ c.direccion }}</td>
          <td class="px-4 py-3 text-gray-500">{{ c.ciudad ?? '—' }}</td>
          <td class="px-4 py-3">
            <span class="capitalize text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {{ c.tipo_conjunto ?? 'otro' }}
            </span>
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
              <router-link :to="`/conjuntos/${c.id}`" class="text-blue-600 hover:underline text-xs font-medium">Ver</router-link>
              <router-link :to="`/conjuntos/${c.id}/editar`" class="text-gray-600 hover:underline text-xs font-medium">Editar</router-link>
              <button @click="$emit('eliminar', c.id)" class="text-red-500 hover:underline text-xs font-medium">Eliminar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Conjunto } from '../types/conjuntos.types'

defineProps<{ conjuntos: Conjunto[] }>()
defineEmits<{ (e: 'eliminar', id: string): void }>()
</script>