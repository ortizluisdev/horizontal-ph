<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">
        PQRS
        <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{{ total }}</span>
      </h3>
      <slot name="actions" />
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="divide-y divide-gray-100">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div class="h-4 w-8  rounded bg-gray-200" />
        <div class="h-4 w-24 rounded bg-gray-200" />
        <div class="h-4 flex-1 rounded bg-gray-200" />
        <div class="h-5 w-20 rounded-full bg-gray-200" />
        <div class="h-5 w-16 rounded-full bg-gray-200" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="flex flex-col items-center py-16 text-gray-400">
      <span class="text-4xl mb-3">📭</span>
      <p class="text-sm">No hay PQRS registradas</p>
    </div>

    <!-- Tabla desktop -->
    <div v-else class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3 text-left">Tipo</th>
            <th class="px-5 py-3 text-left">Radicado</th>
            <th class="px-5 py-3 text-left">Asunto</th>
            <th class="px-5 py-3 text-center">Prioridad</th>
            <th class="px-5 py-3 text-center">Estado</th>
            <th class="px-5 py-3 text-left">Fecha</th>
            <th class="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="emit('select', item)"
          >
            <td class="px-5 py-3.5">
              <span class="text-lg">{{ tipoIcon(item.tipo) }}</span>
            </td>
            <td class="px-5 py-3.5 font-mono text-xs text-gray-500">{{ item.numero_radicado }}</td>
            <td class="px-5 py-3.5 max-w-xs">
              <p class="font-medium text-gray-900 truncate">{{ item.asunto }}</p>
              <p v-if="item.categoria" class="text-xs text-gray-400 capitalize mt-0.5">{{ item.categoria }}</p>
            </td>
            <td class="px-5 py-3.5 text-center">
              <span :class="['rounded-full px-2 py-0.5 text-xs capitalize', prioridadBadgeClass(item.prioridad)]">
                {{ item.prioridad }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-center">
              <PqrsStatusBadge :estado="item.estado" />
            </td>
            <td class="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
              {{ formatDateTime(item.fecha_radicacion) }}
            </td>
            <td class="px-5 py-3.5 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="item.estado === 'abierta'"
                  class="rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors"
                  @click="emit('tomar', item)"
                >
                  Tomar
                </button>
                <button
                  v-if="item.estado === 'en_proceso'"
                  class="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                  @click="emit('resolver', item)"
                >
                  Resolver
                </button>
                <button
                  class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  @click="emit('select', item)"
                >
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

    <!-- Cards mobile -->
    <div class="md:hidden divide-y divide-gray-100">
      <div
        v-for="item in items"
        :key="item.id"
        class="px-4 py-4 space-y-2"
        @click="emit('select', item)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span>{{ tipoIcon(item.tipo) }}</span>
            <p class="text-sm font-medium text-gray-900 truncate">{{ item.asunto }}</p>
          </div>
          <PqrsStatusBadge :estado="item.estado" />
        </div>
        <div class="flex items-center justify-between">
          <span class="font-mono text-xs text-gray-400">{{ item.numero_radicado }}</span>
          <span :class="['rounded-full px-2 py-0.5 text-xs capitalize', prioridadBadgeClass(item.prioridad)]">
            {{ item.prioridad }}
          </span>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="pages > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p class="text-xs text-gray-500">Página {{ currentPage }} de {{ pages }} · {{ total }} registros</p>
      <div class="flex gap-1">
        <button
          :disabled="currentPage === 1"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('page-change', currentPage - 1)"
        >Anterior</button>
        <button
          :disabled="currentPage === pages"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('page-change', currentPage + 1)"
        >Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pqrs } from '../types/pqrs.types'
import { tipoIcon, prioridadBadgeClass, formatDateTime } from '../composables/usePqrs'
import PqrsStatusBadge from './PqrsStatusBadge.vue'

defineProps<{
  items: Pqrs[]
  loading?: boolean
  total?: number
  currentPage?: number
  pages?: number
}>()

const emit = defineEmits<{
  (e: 'select',      item: Pqrs): void
  (e: 'tomar',       item: Pqrs): void
  (e: 'resolver',    item: Pqrs): void
  (e: 'page-change', page: number): void
}>()
</script>