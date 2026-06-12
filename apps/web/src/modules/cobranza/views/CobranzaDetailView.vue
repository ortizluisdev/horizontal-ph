<template>
  <div class="space-y-5">
    <!-- Back -->
    <button
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group"
      @click="router.back()"
    >
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <!-- Loading -->
    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Not found -->
    <div v-else-if="!cobranza" class="text-center py-20 text-gray-400">
      <p class="text-sm">Cobranza no encontrada</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ cobranza.concepto }}</h1>
          <p class="text-sm font-mono text-gray-500 mt-0.5">{{ cobranza.numero_recibo }}</p>
        </div>
        <span :class="['inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset', estadoBadgeClass(cobranza.estado)]">
          {{ ESTADOS_COBRANZA.find((e) => e.value === cobranza!.estado)?.label ?? cobranza.estado }}
        </span>
      </div>

      <!-- Detalle -->
      <div class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div
          v-for="row in detalleRows"
          :key="row.label"
          class="flex items-center justify-between px-5 py-3.5 text-sm"
        >
          <span class="text-gray-500">{{ row.label }}</span>
          <span :class="['font-medium', row.color ?? 'text-gray-900']">{{ row.value }}</span>
        </div>
      </div>

      <!-- Acciones -->
      <div v-if="authStore.isAdmin" class="flex gap-3">
        <button
          v-if="['pendiente', 'vencida', 'en_mora'].includes(cobranza.estado)"
          :disabled="processing"
          class="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 transition-colors"
          @click="handlePagar"
        >
          Marcar como pagada
        </button>
        <button
          v-if="cobranza.estado !== 'anulada' && cobranza.estado !== 'pagada'"
          :disabled="processing"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          @click="handleAnular"
        >
          Anular cobranza
        </button>
      </div>

      <div v-if="estadoError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {{ estadoError }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCobranzaStore } from '../store/cobranza.store'
import { useCobranzaEstado, ESTADOS_COBRANZA, estadoBadgeClass, formatCurrency, formatDate } from '../composables/useCobranza'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const route     = useRoute()
const router    = useRouter()
const store     = useCobranzaStore()
const authStore = useAuthStore()
const { processing, error: estadoError, marcarPagada, anular } = useCobranzaEstado()

const cobranza = computed(() => store.current)

onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())

const detalleRows = computed(() => {
  if (!cobranza.value) return []
  const c = cobranza.value
  return [
    { label: 'Valor total',         value: formatCurrency(c.valor_total),       color: 'text-gray-900 font-bold' },
    { label: 'Valor pagado',        value: formatCurrency(c.valor_pagado ?? 0),  color: 'text-green-700' },
    { label: 'Saldo deuda',         value: formatCurrency(c.valor_deuda  ?? 0),  color: c.valor_deuda ? 'text-red-600' : 'text-gray-900' },
    { label: 'Fecha vencimiento',   value: formatDate(c.fecha_vencimiento) },
    { label: 'Fecha pago',          value: c.fecha_pago ? formatDate(c.fecha_pago) : 'Sin pago' },
    { label: 'Método de pago',      value: c.metodo_pago ?? '-' },
    { label: 'Referencia de pago',  value: c.referencia_pago ?? '-' },
    { label: 'Observaciones',       value: c.observaciones ?? '-' },
    { label: 'Creado',              value: new Date(c.created_at).toLocaleString('es-CO') },
  ]
})

async function handlePagar() {
  if (confirm(`¿Marcar como pagada la cobranza ${cobranza.value?.numero_recibo}?`)) {
    const ok = await marcarPagada(cobranza.value!.id)
    if (ok) router.back()
  }
}

async function handleAnular() {
  if (confirm(`¿Anular la cobranza ${cobranza.value?.numero_recibo}? Esta acción no se puede deshacer.`)) {
    const ok = await anular(cobranza.value!.id)
    if (ok) router.back()
  }
}
</script>