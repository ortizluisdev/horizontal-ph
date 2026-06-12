<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <!-- Header tabla -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">
        Cobranzas
        <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {{ total }}
        </span>
      </h3>
      <slot name="actions" />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="divide-y divide-gray-100">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div class="h-4 w-24 rounded bg-gray-200" />
        <div class="h-4 flex-1 rounded bg-gray-200" />
        <div class="h-4 w-20 rounded bg-gray-200" />
        <div class="h-4 w-16 rounded bg-gray-200" />
        <div class="h-6 w-20 rounded-full bg-gray-200" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg class="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414
             a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-sm">No hay cobranzas para mostrar</p>
    </div>

    <!-- Tabla desktop -->
    <div v-else class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3 text-left">N° Recibo</th>
            <th class="px-5 py-3 text-left">Concepto</th>
            <th class="px-5 py-3 text-right">Valor</th>
            <th class="px-5 py-3 text-center">Vencimiento</th>
            <th class="px-5 py-3 text-center">Estado</th>
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
            <td class="px-5 py-3.5 font-mono text-xs text-gray-600">
              {{ item.numero_recibo }}
            </td>
            <td class="px-5 py-3.5 text-gray-900 max-w-xs truncate">
              {{ item.concepto }}
            </td>
            <td class="px-5 py-3.5 text-right font-semibold text-gray-900">
              {{ formatCurrency(item.valor_total) }}
            </td>
            <td class="px-5 py-3.5 text-center">
              <span :class="['text-xs', isVencida(item.fecha_vencimiento) && item.estado !== 'pagada' ? 'text-red-600 font-medium' : 'text-gray-600']">
                {{ formatDate(item.fecha_vencimiento) }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-center">
              <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(item.estado)]">
                {{ ESTADOS_COBRANZA.find((e) => e.value === item.estado)?.label ?? item.estado }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right" @click.stop>
              <div class="flex items-center justify-end gap-2">
                <button
                  v-if="item.estado === 'pendiente' || item.estado === 'vencida' || item.estado === 'en_mora'"
                  class="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                  @click="emit('marcar-pagada', item)"
                >
                  Pagar
                </button>
                <button
                  v-if="item.estado !== 'anulada' && item.estado !== 'pagada'"
                  class="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  @click="emit('anular', item)"
                >
                  Anular
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
        class="px-4 py-4 space-y-2 active:bg-gray-50"
        @click="emit('select', item)"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ item.concepto }}</p>
            <p class="text-xs text-gray-500 font-mono">{{ item.numero_recibo }}</p>
          </div>
          <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(item.estado)]">
            {{ ESTADOS_COBRANZA.find((e) => e.value === item.estado)?.label ?? item.estado }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-gray-900">{{ formatCurrency(item.valor_total) }}</span>
          <span :class="['text-xs', isVencida(item.fecha_vencimiento) && item.estado !== 'pagada' ? 'text-red-600' : 'text-gray-500']">
            Vence: {{ formatDate(item.fecha_vencimiento) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="pages > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p class="text-xs text-gray-500">
        Página {{ currentPage }} de {{ pages }} · {{ total }} registros
      </p>
      <div class="flex gap-1">
        <button
          :disabled="currentPage === 1"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('page-change', currentPage - 1)"
        >
          Anterior
        </button>
        <button
          :disabled="currentPage === pages"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('page-change', currentPage + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cobranza } from '../types/cobranza.types'
import { ESTADOS_COBRANZA, estadoBadgeClass, formatCurrency, formatDate, isVencida } from '../composables/useCobranza'

defineProps<{
  items:       Cobranza[]
  loading?:    boolean
  total?:      number
  currentPage?: number
  pages?:      number
}>()

const emit = defineEmits<{
  (e: 'select',        item: Cobranza): void
  (e: 'marcar-pagada', item: Cobranza): void
  (e: 'anular',        item: Cobranza): void
  (e: 'page-change',   page: number):   void
}>()
</script>