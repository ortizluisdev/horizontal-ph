<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">
        Cobranzas
        <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {{ total ?? 0 }}
        </span>
      </h3>
      <slot name="actions" />
    </div>

    <!-- Skeleton loading -->
    <div v-if="loading" class="divide-y divide-gray-100">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div class="h-4 w-24 rounded bg-gray-200" />
        <div class="h-4 flex-1 rounded bg-gray-200" />
        <div class="h-4 w-20 rounded bg-gray-200" />
        <div class="h-4 w-16 rounded bg-gray-200" />
        <div class="h-6 w-20 rounded-full bg-gray-200" />
        <div class="h-6 w-24 rounded bg-gray-200" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg class="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-sm font-medium text-gray-500">No hay cobranzas para mostrar</p>
      <p class="text-xs text-gray-400 mt-1">Intenta cambiar los filtros o crear una nueva</p>
    </div>

    <!-- Tabla desktop -->
    <div v-else class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
          <tr>
            <th class="px-5 py-3 text-left">N° Recibo</th>
            <th class="px-5 py-3 text-left">Concepto</th>
            <th class="px-5 py-3 text-right">Total</th>
            <th class="px-5 py-3 text-right">Deuda</th>
            <th class="px-5 py-3 text-center">Vencimiento</th>
            <th class="px-5 py-3 text-center">Estado</th>
            <th class="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-gray-50/60 transition-colors cursor-pointer group"
            @click="emit('select', item)"
          >
            <td class="px-5 py-3.5 font-mono text-xs text-gray-500 group-hover:text-gray-700">
              {{ item.numero_recibo }}
            </td>
            <td class="px-5 py-3.5 text-gray-900 max-w-[200px] truncate">
              {{ item.concepto }}
            </td>
            <td class="px-5 py-3.5 text-right text-gray-700 font-medium">
              {{ formatCurrency(item.valor_total) }}
            </td>
            <td class="px-5 py-3.5 text-right font-semibold" :class="item.valor_deuda > 0 ? 'text-red-600' : 'text-gray-400'">
              {{ item.valor_deuda > 0 ? formatCurrency(item.valor_deuda) : '—' }}
            </td>
            <td class="px-5 py-3.5 text-center">
              <span
                :class="[
                  'text-xs font-medium',
                  isVencida(item.fecha_vencimiento) && item.estado !== 'pagada' && item.estado !== 'anulada'
                    ? 'text-red-600'
                    : 'text-gray-500'
                ]"
              >
                {{ formatDate(item.fecha_vencimiento) }}
                <span
                  v-if="isVencida(item.fecha_vencimiento) && item.estado !== 'pagada' && item.estado !== 'anulada'"
                  class="block text-[10px] text-red-500"
                >
                  hace {{ diasVencida(item.fecha_vencimiento) }}d
                </span>
              </span>
            </td>
            <td class="px-5 py-3.5 text-center">
              <span
                :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(item.estado)]"
              >
                {{ estadoLabel(item.estado) }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1.5">
                <!-- Registrar pago -->
                <button
                  v-if="['pendiente','vencida','en_mora'].includes(item.estado)"
                  class="rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors ring-1 ring-green-200"
                  @click="emit('registrar-pago', item)"
                >
                  Pagar
                </button>
                <!-- Anular -->
                <button
                  v-if="!['anulada','pagada'].includes(item.estado)"
                  class="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors ring-1 ring-gray-200"
                  @click="emit('anular', item)"
                >
                  Anular
                </button>
                <!-- Eliminar (solo pendiente o anulada) -->
                <button
                  v-if="['pendiente','anulada'].includes(item.estado) && showDelete"
                  class="rounded-md bg-red-50 px-2 py-1 text-xs text-red-500 hover:bg-red-100 transition-colors ring-1 ring-red-200"
                  @click="emit('delete', item)"
                  title="Eliminar"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <!-- Ver detalle -->
                <button
                  class="rounded-md p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  @click="emit('select', item)"
                  title="Ver detalle"
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
        class="px-4 py-4 space-y-3 active:bg-gray-50"
        @click="emit('select', item)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ item.concepto }}</p>
            <p class="text-xs text-gray-400 font-mono mt-0.5">{{ item.numero_recibo }}</p>
          </div>
          <span :class="['shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(item.estado)]">
            {{ estadoLabel(item.estado) }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-base font-bold text-gray-900">{{ formatCurrency(item.valor_total) }}</p>
            <p v-if="item.valor_deuda > 0" class="text-xs text-red-600 font-medium">
              Deuda: {{ formatCurrency(item.valor_deuda) }}
            </p>
          </div>
          <div class="text-right">
            <p
              :class="['text-xs font-medium', isVencida(item.fecha_vencimiento) && item.estado !== 'pagada' ? 'text-red-600' : 'text-gray-500']"
            >
              Vence: {{ formatDate(item.fecha_vencimiento) }}
            </p>
          </div>
        </div>
        <!-- Acciones mobile -->
        <div class="flex gap-2" @click.stop>
          <button
            v-if="['pendiente','vencida','en_mora'].includes(item.estado)"
            class="flex-1 rounded-lg bg-green-600 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
            @click="emit('registrar-pago', item)"
          >
            Registrar pago
          </button>
          <button
            v-if="!['anulada','pagada'].includes(item.estado)"
            class="flex-1 rounded-lg border border-gray-300 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            @click="emit('anular', item)"
          >
            Anular
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="(pages ?? 1) > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p class="text-xs text-gray-500">
        Página {{ currentPage }} de {{ pages }} · {{ total }} registros
      </p>
      <div class="flex gap-1.5">
        <button
          :disabled="currentPage === 1"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="emit('page-change', (currentPage ?? 1) - 1)"
        >
          ← Anterior
        </button>
        <button
          :disabled="currentPage === pages"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="emit('page-change', (currentPage ?? 1) + 1)"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cobranza, EstadoCobranza } from '../types/cobranza.types'
import {
  ESTADOS_COBRANZA,
  estadoBadgeClass,
  formatCurrency,
  formatDate,
  isVencida,
  diasVencida,
} from '../composables/useCobranza'

defineProps<{
  items:        Cobranza[]
  loading?:     boolean
  total?:       number
  currentPage?: number
  pages?:       number
  showDelete?:  boolean
}>()

const emit = defineEmits<{
  (e: 'select',          item: Cobranza): void
  (e: 'registrar-pago',  item: Cobranza): void
  (e: 'anular',          item: Cobranza): void
  (e: 'delete',          item: Cobranza): void
  (e: 'page-change',     page: number):   void
}>()

function estadoLabel(estado: EstadoCobranza): string {
  return ESTADOS_COBRANZA.find((e) => e.value === estado)?.label ?? estado
}
</script>