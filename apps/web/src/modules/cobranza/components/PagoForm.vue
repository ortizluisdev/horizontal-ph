<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">Registrar pago</h3>
        <p v-if="cobranza" class="text-xs text-gray-500 mt-0.5 font-mono">{{ cobranza.numero_recibo }}</p>
      </div>
      <button v-if="showClose" class="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100" @click="emit('close')">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Info cobranza -->
    <div v-if="cobranza" class="mx-5 mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Concepto</span>
        <span class="font-medium text-gray-900">{{ cobranza.concepto }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Valor total</span>
        <span class="font-semibold text-gray-900">{{ formatCurrency(cobranza.valor_total) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Ya pagado</span>
        <span class="font-medium text-green-700">{{ formatCurrency(cobranza.valor_pagado) }}</span>
      </div>
      <div class="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
        <span class="text-gray-700 font-semibold">Saldo a pagar</span>
        <span class="text-lg font-bold text-red-600">{{ formatCurrency(cobranza.valor_deuda) }}</span>
      </div>
    </div>

    <div class="p-5 space-y-4">
      <!-- Valor a pagar -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Valor a pagar *</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm font-medium">$</span>
          <input
            v-model.number="form.valor_pagado"
            type="number"
            min="1"
            :max="cobranza?.valor_deuda"
            step="1000"
            placeholder="0"
            :class="[fieldClass(errors.valor_pagado), 'pl-7']"
            @input="errors.valor_pagado = undefined"
          />
        </div>
        <p v-if="errors.valor_pagado" class="mt-1 text-xs text-red-600">{{ errors.valor_pagado }}</p>
        <p v-else-if="form.valor_pagado > 0" class="mt-1 text-xs text-indigo-600 font-medium">
          {{ formatCurrency(form.valor_pagado) }}
          <span v-if="cobranza && form.valor_pagado >= cobranza.valor_deuda" class="ml-1 text-green-600">
            · Pago total ✓
          </span>
          <span v-else-if="cobranza" class="ml-1 text-orange-500">
            · Quedarán {{ formatCurrency(cobranza.valor_deuda - form.valor_pagado) }}
          </span>
        </p>
      </div>

      <!-- Método de pago -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Método de pago *</label>
        <div class="grid grid-cols-3 gap-2">
          <label
            v-for="mp in METODOS_PAGO"
            :key="mp.value"
            :class="[
              'flex items-center justify-center gap-1.5 rounded-lg border py-2 px-3 text-xs font-medium cursor-pointer transition-all',
              form.metodo_pago === mp.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <input type="radio" v-model="form.metodo_pago" :value="mp.value" class="sr-only" />
            {{ mp.label }}
          </label>
        </div>
      </div>

      <!-- Referencia -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">
          Referencia de pago
          <span class="font-normal text-gray-400">(opcional)</span>
        </label>
        <input
          v-model="form.referencia_pago"
          type="text"
          placeholder="N° transacción, comprobante..."
          :class="fieldClass()"
        />
      </div>

      <!-- Fecha de pago -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Fecha de pago</label>
        <input
          v-model="form.fecha_pago"
          type="date"
          :max="today"
          :class="fieldClass()"
        />
      </div>

      <!-- Observaciones -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">
          Observaciones
          <span class="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          v-model="form.observaciones"
          rows="2"
          placeholder="Notas adicionales..."
          :class="[fieldClass(), 'resize-none']"
        />
      </div>

      <!-- Error servidor -->
      <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex gap-2">
        <svg class="h-4 w-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 00-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" />
        </svg>
        {{ serverError }}
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="saving"
          class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          @click="handleSubmit"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Procesando...' : 'Confirmar pago' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cobranza } from '../types/cobranza.types'
import { useRegistrarPago, METODOS_PAGO, formatCurrency } from '../composables/useCobranza'

const props = defineProps<{
  cobranza?:  Cobranza | null
  showClose?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'):           void
  (e: 'saved', id: string): void
}>()

const { form, errors, saving, serverError, submit, reset } = useRegistrarPago()

const today = new Date().toISOString().slice(0, 10)

async function handleSubmit() {
  if (!props.cobranza) return
  const ok = await submit(props.cobranza.id)
  if (ok) {
    emit('saved', props.cobranza.id)
    reset()
  }
}

function fieldClass(error?: string) {
  const base = 'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-100 bg-white`
}
</script>