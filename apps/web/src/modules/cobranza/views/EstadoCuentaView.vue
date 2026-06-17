<template>
  <div class="p-6 space-y-5">
    <div>
      <h1 class="text-xl font-bold text-gray-900">Estado de cuenta</h1>
      <p class="text-sm text-gray-500 mt-0.5">Resumen de deuda por unidad</p>
    </div>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Card resumen -->
      <div class="lg:col-span-1">
        <EstadoCuentaCard
          :cobranzas="store.items"
          :unidad-label="unidadLabel"
        />
      </div>

      <!-- Lista de cobranzas -->
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

const unidadId    = computed(() => authStore.user?.unidad_id ?? undefined)
const unidadLabel = computed(() =>
  unidadId.value ? `#${unidadId.value.slice(0, 8)}` : 'General'
)

onMounted(() => {
  store.fetchList({
    unidadId: unidadId.value,
    page:     1,
    limit:    20,
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
  if (confirm(`¿Cancelar la cobranza ${item.numero_recibo}?`)) {
    await anular(item.id)
  }
}
</script>