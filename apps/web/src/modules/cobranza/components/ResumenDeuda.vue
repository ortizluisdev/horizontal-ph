<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Skeleton -->
    <template v-if="loadingResumen">
      <div
        v-for="i in 4" :key="i"
        class="rounded-xl border border-gray-200 bg-white p-4 animate-pulse space-y-2"
      >
        <div class="h-3 w-24 rounded bg-gray-200" />
        <div class="h-6 w-32 rounded bg-gray-200" />
        <div class="h-3 w-16 rounded bg-gray-200" />
      </div>
    </template>

    <!-- Cards -->
    <template v-else>
      <div
        v-for="card in cards"
        :key="card.label"
        :class="['rounded-xl border p-4 space-y-1.5 transition-shadow hover:shadow-sm', card.bg, card.border]"
      >
        <p :class="['text-xs font-medium uppercase tracking-wide', card.labelColor]">
          {{ card.label }}
        </p>
        <p :class="['text-xl font-bold tabular-nums leading-tight', card.valueColor]">
          {{ card.isCurrency ? formatCurrency(card.value as number) : card.value }}
        </p>
        <p v-if="card.sub" :class="['text-xs', card.subColor]">{{ card.sub }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useCobranzaStore } from '../store/cobranza.store'
import { formatCurrency } from '../composables/useCobranza'

const props = defineProps<{
  conjuntoId?: string
  unidadId?:   string
}>()

const store         = useCobranzaStore()
const loadingResumen = computed(() => store.loading && !store.resumen)
const r              = computed(() => store.resumen)

onMounted(() => loadResumen())
watch(() => [props.conjuntoId, props.unidadId], loadResumen)

function loadResumen() {
  if (props.conjuntoId) {
    store.fetchResumen(props.conjuntoId, props.unidadId)
  }
}

const cards = computed(() => [
  {
    label:      'Pendiente',
    value:      r.value?.total_pendiente ?? 0,
    isCurrency: true,
    bg:         'bg-yellow-50',
    border:     'border-yellow-200',
    labelColor: 'text-yellow-700',
    valueColor: 'text-yellow-900',
    subColor:   'text-yellow-600',
    sub:        r.value ? `${r.value.cantidad_pendientes} factura(s)` : '',
  },
  {
    label:      'Vencido / Mora',
    value:      (r.value?.total_vencido ?? 0) + (r.value?.total_mora ?? 0),
    isCurrency: true,
    bg:         'bg-red-50',
    border:     'border-red-200',
    labelColor: 'text-red-700',
    valueColor: 'text-red-900',
    subColor:   'text-red-600',
    sub:        r.value
      ? `${r.value.cantidad_vencidas + r.value.cantidad_mora} en riesgo`
      : '',
  },
  {
    label:      'Pagado este mes',
    value:      r.value?.total_pagado_mes ?? 0,
    isCurrency: true,
    bg:         'bg-green-50',
    border:     'border-green-200',
    labelColor: 'text-green-700',
    valueColor: 'text-green-900',
    subColor:   'text-green-600',
    sub:        r.value ? `${r.value.cantidad_pagadas} pagada(s)` : '',
  },
  {
    label:      'Total registros',
    value:      store.total,
    isCurrency: false,
    bg:         'bg-indigo-50',
    border:     'border-indigo-200',
    labelColor: 'text-indigo-600',
    valueColor: 'text-indigo-900',
    subColor:   'text-indigo-400',
    sub:        `Página ${store.page} de ${store.pages}`,
  },
])
</script>