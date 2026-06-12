<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-bold text-gray-900">Estado de cuenta</h1>
      <p class="text-sm text-gray-500 mt-0.5">Resumen de deuda por unidad</p>
    </div>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Card estado de cuenta -->
      <div class="lg:col-span-1">
        <EstadoCuentaCard
          :cobranzas="store.items"
          :unidad-label="unidadLabel"
        />
      </div>

      <!-- Lista de pendientes -->
      <div class="lg:col-span-2">
        <FacturaTable
          :items="store.items"
          :loading="store.loading"
          :total="store.total"
          :current-page="store.page"
          :pages="store.pages"
          @select="goToDetail"
          @marcar-pagada="handlePagar"
          @anular="handleAnular"
          @page-change="store.changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCobranzaStore } from '../store/cobranza.store'
import { useCobranzaEstado } from '../composables/useCobranza'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import EstadoCuentaCard from '../components/EstadoCuentaCard.vue'
import FacturaTable from '../components/FacturaTable.vue'
import type { Cobranza } from '../types/cobranza.types'

const router    = useRouter()
const store     = useCobranzaStore()
const authStore = useAuthStore()
const { marcarPagada, anular } = useCobranzaEstado()

// Si el usuario tiene unidad asignada, filtrar solo sus cobranzas
const unidadId   = computed(() => authStore.user?.unidad_id ?? undefined)
const unidadLabel = computed(() => unidadId.value ? `#${unidadId.value.slice(0, 8)}` : 'General')

onMounted(() => {
  store.fetchList({
    unidadId: unidadId.value,
    estado:   '',
    page:     1,
  })
})

function goToDetail(item: Cobranza) {
  router.push(`/cobranza/${item.id}`)
}

async function handlePagar(item: Cobranza) {
  if (confirm(`¿Marcar como pagada la cobranza ${item.numero_recibo}?`)) {
    await marcarPagada(item.id)
  }
}

async function handleAnular(item: Cobranza) {
  if (confirm(`¿Anular la cobranza ${item.numero_recibo}?`)) {
    await anular(item.id)
  }
}
</script>