<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      :class="['rounded-xl border p-4 space-y-1', card.bg, card.border]"
    >
      <p :class="['text-xs font-medium', card.labelColor]">{{ card.label }}</p>
      <p :class="['text-xl font-bold tabular-nums', card.valueColor]">
        {{ card.isCurrency ? formatCurrency(card.value) : card.value }}
      </p>
      <p v-if="card.sub" :class="['text-xs', card.subColor]">{{ card.sub }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCobranzaStore } from '../store/cobranza.store'
import { formatCurrency } from '../composables/useCobranza'

const store = useCobranzaStore()

const cards = computed(() => [
  {
    label:      'Total pendiente',
    value:      store.totalPendiente,
    isCurrency: true,
    bg:         'bg-yellow-50',
    border:     'border-yellow-200',
    labelColor: 'text-yellow-700',
    valueColor: 'text-yellow-900',
    subColor:   'text-yellow-600',
    sub:        `${store.cantidadPendientes} registro(s)`,
  },
  {
    label:      'En mora / Vencido',
    value:      store.totalVencido,
    isCurrency: true,
    bg:         'bg-red-50',
    border:     'border-red-200',
    labelColor: 'text-red-700',
    valueColor: 'text-red-900',
    subColor:   'text-red-600',
    sub:        'Requiere gestión',
  },
  {
    label:      'Total registros',
    value:      store.total,
    isCurrency: false,
    bg:         'bg-gray-50',
    border:     'border-gray-200',
    labelColor: 'text-gray-500',
    valueColor: 'text-gray-900',
    subColor:   'text-gray-400',
    sub:        'En esta vista',
  },
  {
    label:      'Páginas',
    value:      store.pages,
    isCurrency: false,
    bg:         'bg-indigo-50',
    border:     'border-indigo-200',
    labelColor: 'text-indigo-600',
    valueColor: 'text-indigo-900',
    subColor:   'text-indigo-400',
    sub:        `${store.limit} por página`,
  },
])
</script>