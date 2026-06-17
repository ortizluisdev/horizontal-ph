<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">PQRS</h1>
        <p class="text-sm text-gray-500 mt-0.5">Peticiones, quejas, reclamos y sugerencias</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        @click="showForm = true"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva PQRS
      </button>
    </div>

    <!-- Resumen rápido -->
    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
        <p class="text-2xl font-bold text-blue-700">{{ store.abiertas }}</p>
        <p class="text-xs font-medium text-blue-600 mt-0.5">Abiertas</p>
      </div>
      <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
        <p class="text-2xl font-bold text-yellow-700">{{ store.enProceso }}</p>
        <p class="text-xs font-medium text-yellow-600 mt-0.5">En proceso</p>
      </div>
      <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
        <p class="text-2xl font-bold text-red-700">{{ store.urgentes }}</p>
        <p class="text-xs font-medium text-red-600 mt-0.5">Urgentes</p>
      </div>
    </div>

    <PqrsFilters @apply="store.applyFilters" />

    <div class="flex items-center justify-end gap-2">
      <button
        :class="[
          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          vista === 'tabla' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50',
        ]"
        @click="vista = 'tabla'"
      >
        ☰ Lista
      </button>
      <button
        :class="[
          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          vista === 'cards' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50',
        ]"
        @click="vista = 'cards'"
      >
        ⊞ Tarjetas
      </button>
    </div>

    <PqrsTable
      v-if="vista === 'tabla'"
      :items="store.items"
      :loading="store.loading"
      :total="store.total"
      :current-page="store.page"
      :pages="store.pages"
      @select="goToDetail"
      @tomar="handleTomar"
      @resolver="handleResolver"
      @page-change="store.changePage"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-if="store.loading"
        v-for="i in 6"
        :key="i"
        class="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3"
      >
        <div class="h-4 w-3/4 rounded bg-gray-200" />
        <div class="h-3 w-full rounded bg-gray-200" />
        <div class="h-3 w-1/2 rounded bg-gray-200" />
      </div>
      <PqrsCard
        v-else
        v-for="item in store.items"
        :key="item.id"
        :pqrs="item"
        @select="goToDetail"
      />
      <div
        v-if="!store.loading && !store.items.length"
        class="col-span-full flex flex-col items-center py-16 text-gray-400"
      >
        <span class="text-4xl mb-3">📭</span>
        <p class="text-sm">No hay PQRS para mostrar</p>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="showForm = false"
      >
        <div class="w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <PqrsForm :show-close="true" @close="showForm = false" @saved="onSaved" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePqrsStore } from '../store/pqrs.store'
import { usePqrsGestion } from '../composables/usePqrs'
import PqrsFilters from '../components/PqrsFilters.vue'
import PqrsTable from '../components/PqrsTable.vue'
import PqrsCard from '../components/PqrsCard.vue'
import PqrsForm from '../components/PqrsForm.vue'
import type { Pqrs } from '../types/pqrs.types'

const router = useRouter()
const store  = usePqrsStore()
const { tomarCaso, resolver } = usePqrsGestion()

const showForm = ref(false)
const vista    = ref<'tabla' | 'cards'>('tabla')

onMounted(() => store.fetchList())

function goToDetail(item: Pqrs) { router.push(`/pqrs/${item.id}`) }

async function handleTomar(item: Pqrs) {
  const nombre = prompt('¿Nombre del responsable asignado?')
  if (nombre?.trim()) await tomarCaso(item.id, nombre.trim())
}

async function handleResolver(item: Pqrs) {
  const respuesta = prompt('Ingresa la respuesta / solución dada:')
  if (respuesta?.trim()) await resolver(item.id, respuesta.trim())
}

function onSaved() {
  showForm.value = false
  store.fetchList()
}
</script>