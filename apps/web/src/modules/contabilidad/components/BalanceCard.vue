<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-gray-700">{{ titulo }}</h3>
      <span class="text-xs text-gray-400">{{ periodo }}</span>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Débitos</p>
        <p class="text-lg font-bold text-red-600">{{ fmt(total_debitos) }}</p>
      </div>
      <div class="text-center border-x border-gray-100">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Créditos</p>
        <p class="text-lg font-bold text-green-600">{{ fmt(total_creditos) }}</p>
      </div>
      <div class="text-center">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Saldo</p>
        <p class="text-lg font-bold" :class="saldo >= 0 ? 'text-blue-600' : 'text-red-600'">
          {{ fmt(saldo) }}
        </p>
      </div>
    </div>

    <!-- Barra visual -->
    <div v-if="total_debitos + total_creditos > 0" class="space-y-1.5">
      <div class="flex justify-between text-xs text-gray-400">
        <span>Ingresos</span>
        <span>{{ pctCreditos }}%</span>
      </div>
      <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-green-500 rounded-full transition-all duration-500"
          :style="{ width: pctCreditos + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  titulo?: string
  periodo?: string
  total_debitos?: number
  total_creditos?: number
  saldo?: number
}>(), {
  titulo: 'Balance del período',
  periodo: '',
  total_debitos: 0,
  total_creditos: 0,
  saldo: 0,
})

const pctCreditos = computed(() => {
  const total = props.total_debitos + props.total_creditos
  if (!total) return 0
  return Math.round((props.total_creditos / total) * 100)
})

function fmt(val: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(val)
}
</script>