<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Asambleas</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión de asambleas y reuniones del conjunto</p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        @click="router.push('/asambleas/nueva')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva asamblea
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p class="text-2xl font-bold text-blue-700">{{ store.programadas }}</p>
        <p class="text-xs font-medium text-blue-600 mt-0.5">Programadas</p>
      </div>
      <div class="rounded-xl border border-green-200 bg-green-50 p-4">
        <p class="text-2xl font-bold text-green-700">{{ store.enCurso }}</p>
        <p class="text-xs font-medium text-green-600 mt-0.5">En curso</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p class="text-2xl font-bold text-gray-700">{{ store.total }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Total</p>
      </div>
      <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p class="text-2xl font-bold text-indigo-700">{{ store.proximas.length }}</p>
        <p class="text-xs font-medium text-indigo-600 mt-0.5">Próximas</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            v-model="filtros.tipo"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          >
            <option value="">Todos los tipos</option>
            <option v-for="t in TIPOS_ASAMBLEA" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            v-model="filtros.estado"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          >
            <option v-for="e in ESTADOS_ASAMBLEA" :key="e.value" :value="e.value">{{ e.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            v-model="filtros.fechaDesde"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <div class="flex items-end gap-2">
          <button
            class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            @click="store.applyFilters(filtros)"
          >Aplicar</button>
          <button
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="resetFiltros"
          >✕</button>
        </div>
      </div>
    </div>

    <!-- Vista toggle -->
    <div class="flex items-center justify-end gap-2">
      <button
        :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                 vista === 'cards' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']"
        @click="vista = 'cards'"
      >⊞ Tarjetas</button>
      <button
        :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                 vista === 'lista' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']"
        @click="vista = 'lista'"
      >☰ Lista</button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
        <div class="h-4 w-3/4 rounded bg-gray-200" />
        <div class="h-3 w-full rounded bg-gray-200" />
        <div class="h-3 w-1/2 rounded bg-gray-200" />
      </div>
    </div>

    <!-- Cards -->
    <div v-else-if="vista === 'cards'">
      <div v-if="!store.items.length" class="flex flex-col items-center py-16 text-gray-400">
        <span class="text-4xl mb-3">🗓️</span>
        <p class="text-sm">No hay asambleas registradas</p>
        <button
          v-if="authStore.isAdmin"
          class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          @click="router.push('/asambleas/nueva')"
        >Crear primera asamblea</button>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AsambleaCard
          v-for="a in store.items"
          :key="a.id"
          :asamblea="a"
          @select="router.push(`/asambleas/${a.id}`)"
        />
      </div>
    </div>

    <!-- Lista tabla -->
    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div v-if="!store.items.length" class="flex flex-col items-center py-16 text-gray-400">
        <span class="text-4xl mb-3">🗓️</span>
        <p class="text-sm">No hay asambleas registradas</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th class="px-5 py-3 text-left">Tipo</th>
              <th class="px-5 py-3 text-left">Acta / Asunto</th>
              <th class="px-5 py-3 text-left">Fecha</th>
              <th class="px-5 py-3 text-left">Lugar</th>
              <th class="px-5 py-3 text-center">Estado</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="a in store.items"
              :key="a.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="router.push(`/asambleas/${a.id}`)"
            >
              <td class="px-5 py-3.5 text-lg">{{ tipoIcon(a.tipo) }}</td>
              <td class="px-5 py-3.5 max-w-xs">
                <p class="font-medium text-gray-900 truncate">{{ a.asunto }}</p>
                <p class="text-xs font-mono text-gray-400 mt-0.5">Acta {{ a.numero_acta }}</p>
              </td>
              <td class="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{{ formatDateShort(a.fecha_programada) }}</td>
              <td class="px-5 py-3.5 text-xs text-gray-500 max-w-xs truncate">{{ a.lugar ?? '-' }}</td>
              <td class="px-5 py-3.5 text-center">
                <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(a.estado)]">
                  <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(a.estado)]" />
                  {{ ESTADOS_ASAMBLEA.find((e) => e.value === a.estado)?.label }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="authStore.isAdmin && a.estado === 'programada'"
                    class="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                    @click="handleIniciar(a.id)"
                  >Iniciar</button>
                  <button
                    class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    @click="router.push(`/asambleas/${a.id}`)"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="store.pages > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <p class="text-xs text-gray-500">Página {{ store.page }} de {{ store.pages }} · {{ store.total }} registros</p>
        <div class="flex gap-1">
          <button :disabled="store.page === 1" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" @click="store.changePage(store.page - 1)">Anterior</button>
          <button :disabled="store.page === store.pages" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" @click="store.changePage(store.page + 1)">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { useAsambleaEstado, TIPOS_ASAMBLEA, ESTADOS_ASAMBLEA, tipoIcon, estadoBadgeClass, estadoDotClass, formatDateShort } from '../composables/useAsambleas'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import AsambleaCard from '../components/AsambleaCard.vue'
import type { AsambleaFilters } from '../types/asambleas.types'

const router    = useRouter()
const store     = useAsambleasStore()
const authStore = useAuthStore()
const { iniciar } = useAsambleaEstado()

const vista = ref<'cards' | 'lista'>('cards')
const filtros = reactive<AsambleaFilters>({ tipo: '', estado: '', fechaDesde: '' })

onMounted(() => store.fetchList())

function resetFiltros() {
  filtros.tipo = ''; filtros.estado = ''; filtros.fechaDesde = ''
  store.applyFilters(filtros)
}

async function handleIniciar(id: string) {
  if (confirm('¿Iniciar esta asamblea ahora?')) await iniciar(id)
}
</script>