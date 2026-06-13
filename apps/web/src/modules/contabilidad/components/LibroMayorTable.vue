<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Asiento</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Débito</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Crédito</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!movimientos.length">
          <td colspan="9" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <span class="text-4xl">📒</span>
              <p class="text-sm font-medium">Sin movimientos registrados</p>
            </div>
          </td>
        </tr>
        <tr
          v-for="m in movimientos"
          :key="m.id"
          class="hover:bg-blue-50/20 transition-colors"
          :class="m.estado === 'anulado' ? 'opacity-50 line-through' : ''"
        >
          <td class="px-4 py-3 font-mono text-xs text-gray-700 font-semibold">{{ m.numero_asiento }}</td>
          <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(m.fecha_movimiento) }}</td>
          <td class="px-4 py-3">
            <span :class="tipoClass(m.tipo_movimiento)" class="text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
              {{ m.tipo_movimiento }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-600 capitalize text-xs">{{ m.categoria.replace(/_/g, ' ') }}</td>
          <td class="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" :title="m.descripcion">
            {{ m.descripcion ?? '—' }}
          </td>
          <td class="px-4 py-3 text-right font-semibold text-red-600">
            {{ m.valor_debit > 0 ? fmt(m.valor_debit) : '—' }}
          </td>
          <td class="px-4 py-3 text-right font-semibold text-green-600">
            {{ m.valor_credit > 0 ? fmt(m.valor_credit) : '—' }}
          </td>
          <td class="px-4 py-3">
            <span
              :class="m.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
            >
              {{ m.estado }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-1">
              <button
                v-if="m.estado === 'activo'"
                @click="$emit('anular', m.id)"
                class="px-2.5 py-1 rounded-md text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                Anular
              </button>
              <span v-else class="text-xs text-gray-400 px-2">—</span>
            </div>
          </td>
        </tr>
      </tbody>

      <!-- Totales -->
      <tfoot v-if="movimientos.length" class="bg-gray-50 border-t-2 border-gray-200">
        <tr>
          <td colspan="5" class="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
            Totales del período
          </td>
          <td class="px-4 py-3 text-right text-sm font-bold text-red-600">{{ fmt(totalDebitos) }}</td>
          <td class="px-4 py-3 text-right text-sm font-bold text-green-600">{{ fmt(totalCreditos) }}</td>
          <td colspan="2" class="px-4 py-3 text-right text-sm font-bold"
            :class="saldo >= 0 ? 'text-blue-700' : 'text-red-700'"
          >
            Saldo: {{ fmt(saldo) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Movimiento, TipoMovimiento } from '../types/contabilidad.types'

const props = defineProps<{ movimientos: Movimiento[] }>()
defineEmits<{ (e: 'anular', id: string): void }>()

const totalDebitos  = computed(() => props.movimientos.filter(m => m.estado === 'activo').reduce((s, m) => s + m.valor_debit, 0))
const totalCreditos = computed(() => props.movimientos.filter(m => m.estado === 'activo').reduce((s, m) => s + m.valor_credit, 0))
const saldo         = computed(() => totalCreditos.value - totalDebitos.value)

function tipoClass(tipo: TipoMovimiento) {
  return {
    ingreso:  'bg-green-100 text-green-700',
    egreso:   'bg-red-100 text-red-700',
    ajuste:   'bg-yellow-100 text-yellow-700',
    traslado: 'bg-blue-100 text-blue-700',
    apertura: 'bg-purple-100 text-purple-700',
    cierre:   'bg-gray-200 text-gray-700',
  }[tipo] ?? 'bg-gray-100 text-gray-600'
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-CO', { dateStyle: 'medium' })
}

function fmt(val: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>