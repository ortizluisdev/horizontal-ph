<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Normativa</h1>
        <p class="text-sm text-gray-500 mt-0.5">Documentos legales y reglamentarios del conjunto</p>
      </div>
      <button v-if="authStore.isAdmin"
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        @click="router.push('/normativa/nuevo')">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo documento
      </button>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-green-200 bg-green-50 p-4">
        <p class="text-2xl font-bold text-green-700">{{ store.vigentes }}</p>
        <p class="text-xs font-medium text-green-600 mt-0.5">Vigentes</p>
      </div>
      <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p class="text-2xl font-bold text-yellow-700">{{ store.enRevision }}</p>
        <p class="text-xs font-medium text-yellow-600 mt-0.5">En revisión</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p class="text-2xl font-bold text-gray-700">{{ store.total }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Total</p>
      </div>
      <div class="rounded-xl border border-red-200 bg-red-50 p-4">
        <p class="text-2xl font-bold text-red-700">{{ store.proximosAVencer.length }}</p>
        <p class="text-xs font-medium text-red-500 mt-0.5">Próx. a vencer</p>
      </div>
    </div>
    <div v-if="store.proximosAVencer.length" class="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      <div class="flex items-start gap-3">
        <span class="text-xl shrink-0">⚠️</span>
        <div>
          <p class="text-sm font-semibold text-yellow-800">Documentos próximos a vencer</p>
          <ul class="mt-1 space-y-0.5">
            <li v-for="doc in store.proximosAVencer" :key="doc.id"
              class="text-xs text-yellow-700 cursor-pointer hover:underline"
              @click="router.push(`/normativa/${doc.id}`)">
              {{ doc.titulo }} — vence {{ formatDateShort(doc.fecha_vigencia_hasta!) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <NormativaFilters v-model="filtros" @apply="store.applyFilters(filtros)" @reset="resetFiltros" />
    <div class="flex items-center justify-end gap-2">
      <button :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', vista === 'cards' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']" @click="vista = 'cards'">⊞ Tarjetas</button>
      <button :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', vista === 'tabla' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']" @click="vista = 'tabla'">☰ Tabla</button>
    </div>
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
        <div class="h-4 w-3/4 rounded bg-gray-200" /><div class="h-3 w-full rounded bg-gray-200" /><div class="h-3 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
    <div v-else-if="vista === 'cards'">
      <div v-if="!store.items.length" class="flex flex-col items-center py-16 text-gray-400">
        <span class="text-4xl mb-3">📂</span>
        <p class="text-sm">No hay documentos registrados</p>
        <button v-if="authStore.isAdmin"
          class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          @click="router.push('/normativa/nuevo')">Agregar primer documento</button>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DocumentoCard v-for="doc in store.items" :key="doc.id" :doc="doc" @select="router.push(`/normativa/${doc.id}`)" />
      </div>
    </div>
    <DocumentoTable v-else :items="store.items" :page="store.page" :pages="store.pages" :total="store.total"
      :show-admin="authStore.isAdmin"
      @select="router.push(`/normativa/${$event.id}`)"
      @derogar="handleDerogar"
      @page="store.changePage" />
    <div v-if="vista === 'cards' && store.pages > 1" class="flex items-center justify-between border-t border-gray-100 pt-4">
      <p class="text-xs text-gray-500">Página {{ store.page }} de {{ store.pages }} · {{ store.total }} documentos</p>
      <div class="flex gap-1">
        <button :disabled="store.page === 1" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" @click="store.changePage(store.page - 1)">Anterior</button>
        <button :disabled="store.page === store.pages" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" @click="store.changePage(store.page + 1)">Siguiente</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNormativaStore } from '../store/normativa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { formatDateShort } from '../composables/useNormativa'
import DocumentoCard from '../components/DocumentoCard.vue'
import DocumentoTable from '../components/DocumentoTable.vue'
import NormativaFilters from '../components/NormativaFilters.vue'
import type { NormativaFilters as Filters, Normativa } from '../types/normativa.types'
const router    = useRouter()
const store     = useNormativaStore()
const authStore = useAuthStore()
const vista   = ref<'cards' | 'tabla'>('cards')
const filtros = reactive<Filters>({ tipo: '', estado: '', categoria_legal: '', search: '' })
onMounted(() => store.fetchList())
function resetFiltros() {
  filtros.tipo = ''; filtros.estado = ''; filtros.categoria_legal = ''; filtros.search = ''
  store.applyFilters(filtros)
}
async function handleDerogar(doc: Normativa) {
  if (confirm(`¿Derogar "${doc.titulo}"?`)) await store.cambiarEstado(doc.id, 'derogado')
}
</script>