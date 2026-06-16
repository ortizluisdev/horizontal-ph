<template>
  <div class="space-y-5">
    <!-- Back -->
    <button
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group transition-colors"
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
      <svg class="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-sm font-medium">Cobranza no encontrada</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ cobranza.concepto }}</h1>
          <p class="text-sm font-mono text-gray-400 mt-0.5">{{ cobranza.numero_recibo }}</p>
          <p v-if="cobranza.mes_facturacion && cobranza.anio_facturacion" class="text-xs text-gray-400 mt-0.5">
            {{ mesLabel(cobranza.mes_facturacion) }} {{ cobranza.anio_facturacion }}
          </p>
        </div>
        <span :class="['shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset', estadoBadgeClass(cobranza.estado)]">
          {{ estadoLabel(cobranza.estado) }}
        </span>
      </div>

      <!-- Progreso de pago -->
      <div v-if="cobranza.valor_pagado > 0 || cobranza.estado === 'pagada'" class="rounded-xl border border-gray-200 bg-white p-5">
        <div class="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Progreso de pago</span>
          <span>{{ Math.round(progresoPago) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-green-500 h-2.5 rounded-full transition-all"
            :style="{ width: `${progresoPago}%` }"
          />
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-500">
          <span>Pagado: <strong class="text-green-700">{{ formatCurrency(cobranza.valor_pagado) }}</strong></span>
          <span>Deuda: <strong class="text-red-600">{{ formatCurrency(cobranza.valor_deuda) }}</strong></span>
        </div>
      </div>

      <!-- Detalle financiero -->
      <div class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div class="px-5 py-3 bg-gray-50/50 rounded-t-xl">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Información financiera</p>
        </div>
        <div v-for="row in detalleFinanciero" :key="row.label"
          class="flex items-center justify-between px-5 py-3.5 text-sm">
          <span class="text-gray-500">{{ row.label }}</span>
          <span :class="['font-semibold tabular-nums', row.color ?? 'text-gray-900']">{{ row.value }}</span>
        </div>
      </div>

      <!-- Detalle pago -->
      <div v-if="cobranza.fecha_pago || cobranza.metodo_pago" class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div class="px-5 py-3 bg-gray-50/50 rounded-t-xl">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Información de pago</p>
        </div>
        <div v-for="row in detallePago" :key="row.label"
          class="flex items-center justify-between px-5 py-3.5 text-sm">
          <span class="text-gray-500">{{ row.label }}</span>
          <span class="font-medium text-gray-900">{{ row.value }}</span>
        </div>
      </div>

      <!-- Observaciones -->
      <div v-if="cobranza.descripcion || cobranza.observaciones" class="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</p>
        <p v-if="cobranza.descripcion" class="text-sm text-gray-700">{{ cobranza.descripcion }}</p>
        <p v-if="cobranza.observaciones" class="text-sm text-gray-600 italic">{{ cobranza.observaciones }}</p>
      </div>

      <!-- Acciones admin -->
      <div v-if="authStore.isAdmin" class="space-y-3">
        <div class="flex gap-3">
          <!-- Registrar pago -->
          <button
            v-if="['pendiente','vencida','en_mora'].includes(cobranza.estado)"
            class="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 transition-colors shadow-sm"
            @click="showPago = true"
          >
            Registrar pago
          </button>
          <!-- Editar -->
          <button
            v-if="cobranza.estado !== 'anulada' && cobranza.estado !== 'pagada'"
            class="flex-1 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            @click="router.push(`/cobranza/${cobranza.id}/editar`)"
          >
            Editar
          </button>
          <!-- Anular -->
          <button
            v-if="!['anulada','pagada'].includes(cobranza.estado)"
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            @click="handleAnular"
          >
            Anular
          </button>
        </div>

        <!-- Eliminar (solo pendiente o anulada) -->
        <button
          v-if="['pendiente','anulada'].includes(cobranza.estado)"
          class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          @click="handleDelete"
        >
          Eliminar cobranza
        </button>

        <div v-if="estadoError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {{ estadoError }}
        </div>
      </div>
    </template>

    <!-- Modal: registrar pago -->
    <Teleport to="body">
      <div
        v-if="showPago && cobranza"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="showPago = false"
      >
        <div class="w-full max-w-md">
          <PagoForm
            :cobranza="cobranza"
            :show-close="true"
            @close="showPago = false"
            @saved="onPagoSaved"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCobranzaStore } from '../store/cobranza.store'
import { useCobranzaEstado, ESTADOS_COBRANZA, MESES, estadoBadgeClass, formatCurrency, formatDate } from '../composables/useCobranza'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import PagoForm from '../components/PagoForm.vue'
import type { EstadoCobranza } from '../types/cobranza.types'

const route    = useRoute()
const router   = useRouter()
const store    = useCobranzaStore()
const authStore = useAuthStore()
const { error: estadoError, anular } = useCobranzaEstado()

const cobranza = computed(() => store.current)
const showPago = ref(false)

onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())

const progresoPago = computed(() => {
  if (!cobranza.value) return 0
  return Math.min(100, (cobranza.value.valor_pagado / cobranza.value.valor_total) * 100)
})

const detalleFinanciero = computed(() => {
  if (!cobranza.value) return []
  const c = cobranza.value
  return [
    { label: 'Valor base',       value: c.valor_base    ? formatCurrency(c.valor_base)    : '—' },
    { label: 'Impuesto',         value: c.valor_impuesto ? formatCurrency(c.valor_impuesto) : '—' },
    { label: 'Valor total',      value: formatCurrency(c.valor_total),   color: 'text-gray-900' },
    { label: 'Valor pagado',     value: formatCurrency(c.valor_pagado),  color: 'text-green-700' },
    { label: 'Saldo pendiente',  value: formatCurrency(c.valor_deuda),   color: c.valor_deuda > 0 ? 'text-red-600' : 'text-gray-400' },
    { label: 'Vence',            value: formatDate(c.fecha_vencimiento) },
    { label: 'Emitida',          value: c.fecha_emision ? formatDate(c.fecha_emision) : '—' },
    { label: 'Creado',           value: new Date(c.created_at).toLocaleString('es-CO') },
  ]
})

const detallePago = computed(() => {
  if (!cobranza.value) return []
  const c = cobranza.value
  return [
    { label: 'Fecha de pago',    value: c.fecha_pago ? formatDate(c.fecha_pago) : '—' },
    { label: 'Método de pago',   value: c.metodo_pago ?? '—' },
    { label: 'Referencia',       value: c.referencia_pago ?? '—' },
  ]
})

function estadoLabel(estado: EstadoCobranza): string {
  return ESTADOS_COBRANZA.find((e) => e.value === estado)?.label ?? estado
}

function mesLabel(mes: number): string {
  return MESES.find((m) => m.value === mes)?.label ?? ''
}

async function handleAnular() {
  if (!cobranza.value) return
  if (!confirm(`¿Anular la cobranza ${cobranza.value.numero_recibo}? Esta acción no se puede deshacer.`)) return
  const ok = await anular(cobranza.value.id)
  if (ok) router.back()
}

async function handleDelete() {
  if (!cobranza.value) return
  if (!confirm(`¿Eliminar permanentemente la cobranza ${cobranza.value.numero_recibo}?`)) return
  await store.remove(cobranza.value.id)
  router.back()
}

function onPagoSaved() {
  showPago.value = false
  store.fetchOne(route.params.id as string)
}
</script>