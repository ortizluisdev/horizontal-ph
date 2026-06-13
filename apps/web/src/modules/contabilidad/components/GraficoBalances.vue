<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-sm font-semibold text-gray-700">Débitos vs Créditos por categoría</h3>
    </div>

    <div v-if="!items.length" class="flex flex-col items-center justify-center py-12 text-gray-400">
      <span class="text-4xl mb-2">📊</span>
      <p class="text-sm">Sin datos para graficar</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.categoria" class="space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-gray-600 capitalize">
            {{ item.categoria.replace(/_/g, ' ') }}
          </span>
          <div class="flex gap-3 text-xs">
            <span class="text-red-500 font-semibold">-{{ fmt(item.debito) }}</span>
            <span class="text-green-600 font-semibold">+{{ fmt(item.credito) }}</span>
          </div>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
          <div
            class="h-full bg-red-400 rounded-l-full transition-all duration-500"
            :style="{ width: pct(item.debito, item) + '%' }"
          />
          <div
            class="h-full bg-green-400 rounded-r-full transition-all duration-500"
            :style="{ width: pct(item.credito, item) + '%' }"
          />
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="flex gap-4 mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="w-3 h-3 rounded-sm bg-red-400 shrink-0" /> Débitos
      </div>
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="w-3 h-3 rounded-sm bg-green-400 shrink-0" /> Créditos
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GraficoItem {
  categoria: string
  debito: number
  credito: number
}

const props = withDefaults(defineProps<{ items?: GraficoItem[] }>(), { items: () => [] })

function pct(val: number, item: GraficoItem) {
  const total = item.debito + item.credito
  if (!total) return 0
  return Math.round((val / total) * 100)
}

function fmt(val: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(val)
}
</script>