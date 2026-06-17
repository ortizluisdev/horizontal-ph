<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Cobranza</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión de facturas y recibos del conjunto</p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        @click="showForm = true"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva cobranza
      </button>
    </div>

    <!-- Resumen -->
    <ResumenDeuda />

    <!-- Filtros -->
    <CobranzaFilters @apply="onApplyFilters" />

    <!-- Error -->
    <p
      v-if="store.error"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      {{ store.error }}
    </p>

    <!-- Tabla -->
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

    <!-- Modal: nueva cobranza -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="showForm = false"
      >
        <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <CobranzaForm
            modo="crear"
            :conjunto-id="conjuntoId"
            :show-close="true"
            @close="showForm = false"
            @saved="onSaved"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCobranzaStore } from '../store/cobranza.store'
import { useCobranzaEstado } from '../composables/useCobranza'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import ResumenDeuda from '../components/ResumenDeuda.vue'
import CobranzaFilters from '../components/CobranzaFilters.vue'
import FacturaTable from '../components/FacturaTable.vue'
import CobranzaForm from '../components/CobranzaForm.vue'
import type { Cobranza, CobranzaFilters as CobranzaFiltersType } from '../types/cobranza.types'

const router    = useRouter()
const store     = useCobranzaStore()
const authStore = useAuthStore()
const { marcarPagada, anular } = useCobranzaEstado()

// conjunto_id del usuario autenticado si existe
const conjuntoId = computed(() =>
  (authStore.user as any)?.conjunto_id as string | undefined
)

const showForm = ref(false)

onMounted(() => {
  store.fetchList({
    page:       1,
    limit:      20,
    conjuntoId: conjuntoId.value,
  })
})

function goToDetail(item: Cobranza) {
  router.push(`/cobranza/${item.id}`)
}

function onApplyFilters(filters: CobranzaFiltersType) {
  store.applyFilters({
    ...filters,
    conjuntoId: conjuntoId.value,
  })
}

async function handlePagar(item: Cobranza) {
  if (!confirm(`¿Marcar como pagada la cobranza ${item.numero_recibo}?`)) return
  await marcarPagada(item.id)
}

async function handleAnular(item: Cobranza) {
  if (!confirm(`¿Cancelar la cobranza ${item.numero_recibo}? Esta acción no se puede deshacer.`)) return
  const ok = await anular(item.id)
  if (!ok) store.fetchList()
}

function onSaved() {
  showForm.value = false
  store.fetchList({
    page:       1,
    limit:      20,
    conjuntoId: conjuntoId.value,
  })
}
</script>