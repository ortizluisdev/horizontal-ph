<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Balances</h1>
      <p class="text-sm text-gray-500 mt-0.5">Consulta el balance financiero por período</p>
    </div>

    <!-- Filtro período -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">Selecciona el período</h3>
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</label>
          <input v-model="filtro.fechaDesde" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hasta</label>
          <input v-model="filtro.fechaHasta" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID Conjunto</label>
          <input v-model="filtro.conjuntoId" type="text" placeholder="UUID del conjunto" class="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button
          @click="consultar"
          :disabled="!filtro.conjuntoId || !filtro.fechaDesde || !filtro.fechaHasta || loading"
          class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Consultando...' : 'Consultar' }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <span>⚠️</span> {{ error }}
    </div>

    <!-- Resultado -->
    <BalanceCard
      v-if="store.balance"
      titulo="Balance del período"
      :periodo="`${store.balance.fechaDesde} → ${store.balance.fechaHasta}`"
      :total_debitos="store.balance.total_debitos"
      :total_creditos="store.balance.total_creditos"
      :saldo="store.balance.saldo"
    />

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <span class="text-5xl mb-3">📊</span>
      <p class="text-sm">Selecciona un período y conjunto para consultar el balance</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useContabilidad } from '../composables/useContabilidad'
import { useContabilidadStore } from '../store/contabilidad.store'
import BalanceCard from '../components/BalanceCard.vue'

const { loading, error, cargarBalance } = useContabilidad()
const store = useContabilidadStore()

const filtro = reactive({ conjuntoId: '', fechaDesde: '', fechaHasta: '' })

function consultar() {
  if (!filtro.conjuntoId || !filtro.fechaDesde || !filtro.fechaHasta) return
  cargarBalance({ ...filtro })
}
</script>