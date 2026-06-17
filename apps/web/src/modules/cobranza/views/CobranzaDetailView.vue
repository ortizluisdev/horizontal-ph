<template>
  <div class="p-6 max-w-3xl mx-auto space-y-5">
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
      <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Not found -->
    <div v-else-if="!cobranza" class="text-center py-20 text-gray-400">
      <p class="text-sm">Cobranza no encontrada</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ cobranza.concepto }}</h1>
          <p class="text-sm font-mono text-gray-500 mt-0.5">{{ cobranza.numero_recibo }}</p>
          <p v-if="cobranza.descripcion" class="text-sm text-gray-400 mt-1">
            {{ cobranza.descripcion }}
          </p>
        </div>
        <span
          :class="[
            'shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset',
            estadoBadgeClass(cobranza.estado),
          ]"
        >
          {{ labelEstado(cobranza.estado) }}
        </span>
      </div>

      <!-- Grid de datos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Valores -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Importes</h3>
          <dl class="space-y-2">
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Valor base</dt>
              <dd class="font-medium text-gray-900">{{ formatCurrency(cobranza.valor_base) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">IVA / Recargo</dt>
              <dd class="font-medium text-gray-900">{{ formatCurrency(cobranza.valor_impuesto) }}</dd>
            </div>
            <div class="flex justify-between text-sm border-t border-gray-100 pt-2">
              <dt class="font-semibold text-gray-700">Valor total</dt>
              <dd class="font-bold text-gray-900">{{ formatCurrency(cobranza.valor_total) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Valor pagado</dt>
              <dd class="font-medium text-green-700">{{ formatCurrency(cobranza.valor_pagado) }}</dd>
            </div>
            <div v-if="(cobranza.valor_deuda ?? 0) > 0" class="flex justify-between text-sm">
              <dt class="text-gray-400">Saldo deuda</dt>
              <dd class="font-bold text-red-600">{{ formatCurrency(cobranza.valor_deuda ?? 0) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Fechas y pago -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Fechas y pago</h3>
          <dl class="space-y-2">
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Emisión</dt>
              <dd class="font-medium text-gray-900">{{ formatDate(cobranza.fecha_emision) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Vencimiento</dt>
              <dd
                :class="[
                  'font-medium',
                  isVencida(cobranza.fecha_vencimiento) && cobranza.estado !== 'pagado'
                    ? 'text-red-600'
                    : 'text-gray-900',
                ]"
              >
                {{ formatDate(cobranza.fecha_vencimiento) }}
              </dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Fecha pago</dt>
              <dd class="font-medium text-gray-900">
                {{ cobranza.fecha_pago ? formatDate(cobranza.fecha_pago) : '—' }}
              </dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Método de pago</dt>
              <dd class="font-medium text-gray-900">
                {{ cobranza.metodo_pago ? METODO_PAGO_LABELS[cobranza.metodo_pago] : '—' }}
              </dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-400">Referencia</dt>
              <dd class="font-medium text-gray-900 font-mono text-xs">
                {{ cobranza.referencia_pago ?? '—' }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Facturación -->
        <div v-if="cobranza.mes_facturacion || cobranza.anio_facturacion" class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Facturación</h3>
          <p class="text-sm text-gray-600">
            Período: {{ cobranza.mes_facturacion ?? '—' }} / {{ cobranza.anio_facturacion ?? '—' }}
          </p>
        </div>

        <!-- Observaciones -->
        <div v-if="cobranza.observaciones" class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Observaciones</h3>
          <p class="text-sm text-gray-600">{{ cobranza.observaciones }}</p>
        </div>

        <!-- Metadata -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Metadata</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <dt class="text-gray-400">ID</dt>
              <dd class="font-mono text-gray-600">{{ cobranza.id }}</dd>
            </div>
            <div>
              <dt class="text-gray-400">Unidad</dt>
              <dd class="font-mono text-gray-600">{{ cobranza.unidad_id }}</dd>
            </div>
            <div>
              <dt class="text-gray-400">Creado</dt>
              <dd class="text-gray-600">{{ new Date(cobranza.created_at).toLocaleString('es-CO') }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones admin -->
      <div v-if="authStore.isAdmin" class="flex gap-3">
        <button
          v-if="['pendiente', 'parcial', 'vencido'].includes(cobranza.estado)"
          :disabled="processing"
          class="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 transition-colors"
          @click="handlePagar"
        >
          Marcar como pagada
        </button>
        <button
          v-if="!['cancelado', 'pagado'].includes(cobranza.estado)"
          :disabled="processing"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          @click="handleAnular"
        >
          Cancelar cobranza
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
import {
  useCobranzaEstado,
  estadoBadgeClass,
  formatCurrency,
  formatDate,
  isVencida,
  labelEstado,
} from '../composables/useCobranza'
import { METODO_PAGO_LABELS } from '../types/cobranza.types'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const route     = useRoute()
const router    = useRouter()
const store     = useCobranzaStore()
const authStore = useAuthStore()
const { processing, error: estadoError, marcarPagada, anular } = useCobranzaEstado()

const cobranza = computed(() => store.current)

onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())

async function handlePagar() {
  if (confirm(`¿Marcar como pagada la cobranza ${cobranza.value?.numero_recibo}?`)) {
    const ok = await marcarPagada(cobranza.value!.id)
    if (ok) await store.fetchOne(cobranza.value!.id)
  }
}

async function handleAnular() {
  if (confirm(`¿Cancelar la cobranza ${cobranza.value?.numero_recibo}? Esta acción no se puede deshacer.`)) {
    const ok = await anular(cobranza.value!.id)
    if (ok) router.back()
  }
}
</script>