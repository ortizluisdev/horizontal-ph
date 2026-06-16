<template>
  <div class="space-y-5">
    <!-- Page header -->
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
    <ResumenDeuda :conjunto-id="conjuntoId" />

    <!-- Filtros -->
    <CobranzaFilters @apply="store.applyFilters" />

    <!-- Tabla -->
    <FacturaTable
      :items="store.items"
      :loading="store.loading"
      :total="store.total"
      :current-page="store.page"
      :pages="store.pages"
      :show-delete="authStore.isAdmin"
      @select="goToDetail"
      @registrar-pago="openPago"
      @anular="handleAnular"
      @delete="handleDelete"
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

    <!-- Modal: registrar pago -->
    <Teleport to="body">
      <div
        v-if="showPago && pagoCobranza"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="closePago"
      >
        <div class="w-full max-w-md">
          <PagoForm
            :cobranza="pagoCobranza"
            :show-close="true"
            @close="closePago"
            @saved="onPagoSaved"
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
import PagoForm from '../components/PagoForm.vue'
import type { Cobranza } from '../types/cobranza.types'

const router    = useRouter()
const store     = useCobranzaStore()
const authStore = useAuthStore()
const { anular } = useCobranzaEstado()

const conjuntoId   = computed(() => (authStore.user as any)?.conjunto_id ?? '')
const showForm     = ref(false)
const showPago     = ref(false)
const pagoCobranza = ref<Cobranza | null>(null)

onMounted(() => {
  store.fetchList()
  if (conjuntoId.value) store.fetchResumen(conjuntoId.value)
})

function goToDetail(item: Cobranza) {
  router.push(`/cobranza/${item.id}`)
}

function openPago(item: Cobranza) {
  pagoCobranza.value = item
  showPago.value     = true
}

function closePago() {
  showPago.value     = false
  pagoCobranza.value = null
}

async function handleAnular(item: Cobranza) {
  if (!confirm(`¿Anular la cobranza ${item.numero_recibo}? Esta acción no se puede deshacer.`)) return
  const ok = await anular(item.id)
  if (!ok) alert('Error al anular la cobranza')
}

async function handleDelete(item: Cobranza) {
  if (!confirm(`¿Eliminar la cobranza ${item.numero_recibo}? Esta acción es permanente.`)) return
  await store.remove(item.id)
}

function onSaved() {
  showForm.value = false
  store.fetchList()
  if (conjuntoId.value) store.fetchResumen(conjuntoId.value)
}

function onPagoSaved() {
  closePago()
  store.fetchList({ ...store.filters })
  if (conjuntoId.value) store.fetchResumen(conjuntoId.value)
}
</script>