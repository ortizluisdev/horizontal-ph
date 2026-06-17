<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Pagos recibidos</h1>
        <p class="text-sm text-gray-500 mt-0.5">Historial de cobranzas pagadas</p>
      </div>
    </div>

    <ResumenDeuda />

    <FacturaTable
      :items="store.items"
      :loading="store.loading"
      :total="store.total"
      :current-page="store.page"
      :pages="store.pages"
      @select="goToDetail"
      @marcar-pagada="() => {}"
      @anular="() => {}"
      @page-change="store.changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCobranzaStore } from '../store/cobranza.store'
import ResumenDeuda from '../components/ResumenDeuda.vue'
import FacturaTable from '../components/FacturaTable.vue'
import type { Cobranza } from '../types/cobranza.types'

const router = useRouter()
const store  = useCobranzaStore()

onMounted(() => store.fetchList({ estado: 'pagado', page: 1, limit: 20 }))

function goToDetail(item: Cobranza) {
  router.push(`/cobranza/${item.id}`)
}
</script>