<template>
  <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-indigo-200 text-xs font-medium">Estado de cuenta</p>
          <p class="text-white font-semibold text-lg mt-0.5">Unidad {{ unidadLabel ?? 'General' }}</p>
        </div>
        <div :class="['rounded-full px-3 py-1 text-xs font-semibold', saldoClass]">
          {{ saldoLabel }}
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="p-5 space-y-4">
      <div class="space-y-2">
        <div
          v-for="row in rows"
          :key="row.label"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-500">{{ row.label }}</span>
          <span :class="['font-semibold tabular-nums', row.color]">
            {{ formatCurrency(row.value) }}
          </span>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-900">Saldo pendiente total</span>
          <span :class="['text-lg font-bold tabular-nums', totalDeuda > 0 ? 'text-red-600' : 'text-green-600']">
            {{ formatCurrency(totalDeuda) }}
          </span>
        </div>
      </div>

      <!-- Último movimiento -->
      <div v-if="ultimaCobranza" class="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
        <p class="font-medium text-gray-700">Último movimiento</p>
        <p>{{ ultimaCobranza.concepto }} — {{ formatCurrency(ultimaCobranza.valor_total) }}</p>
        <p>Vence: {{ formatDate(ultimaCobranza.fecha_vencimiento) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Cobranza } from '../types/cobranza.types'
import { formatCurrency, formatDate } from '../composables/useCobranza'

const props = defineProps<{
  cobranzas:    Cobranza[]
  unidadLabel?: string
}>()

const pendientes = computed(() =>
  props.cobranzas.filter((c) => ['pendiente', 'parcial'].includes(c.estado))
)
const vencidas = computed(() =>
  props.cobranzas.filter((c) => c.estado === 'vencido')
)
const pagadas = computed(() =>
  props.cobranzas.filter((c) => c.estado === 'pagado')
)

const sumOf = (arr: Cobranza[]) =>
  arr.reduce((s, c) => s + (c.valor_deuda ?? c.valor_total), 0)

const sumPagado = (arr: Cobranza[]) =>
  arr.reduce((s, c) => s + c.valor_pagado, 0)

const totalDeuda  = computed(() => sumOf(pendientes.value) + sumOf(vencidas.value))
const totalPagado = computed(() => sumPagado(pagadas.value))

const rows = computed(() => [
  { label: 'Pendiente de pago',  value: sumOf(pendientes.value), color: 'text-yellow-700' },
  { label: 'Vencido',            value: sumOf(vencidas.value),   color: 'text-red-600'    },
  { label: 'Pagado (historial)', value: totalPagado.value,       color: 'text-green-700'  },
])

const ultimaCobranza = computed(() =>
  [...props.cobranzas].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
)

const saldoClass = computed(() =>
  totalDeuda.value > 0
    ? 'bg-red-500/20 text-red-100'
    : 'bg-green-500/20 text-green-100'
)

const saldoLabel = computed(() => (totalDeuda.value > 0 ? 'Con saldo pendiente' : 'Al día'))
</script>