<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Asambleas</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión de asambleas y reuniones del conjunto</p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition-all"
        @click="router.push('/asambleas/nueva')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Nueva asamblea
      </button>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl bg-white border border-blue-100 shadow-sm p-5 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-blue-500 uppercase tracking-wide">Programadas</span>
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-base">📅</span>
        </div>
        <p class="text-3xl font-bold text-blue-700 mt-1">{{ store.programadas }}</p>
        <p class="text-xs text-gray-400">Próximas a realizarse</p>
      </div>

      <div class="rounded-2xl bg-white border border-green-100 shadow-sm p-5 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-green-600 uppercase tracking-wide">En curso</span>
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 text-base">🟢</span>
        </div>
        <p class="text-3xl font-bold text-green-700 mt-1">{{ store.enCurso }}</p>
        <p class="text-xs text-gray-400">En este momento</p>
      </div>

      <div class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Realizadas</span>
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-base">✅</span>
        </div>
        <p class="text-3xl font-bold text-gray-700 mt-1">{{ store.realizadas }}</p>
        <p class="text-xs text-gray-400">Completadas</p>
      </div>

      <div class="rounded-2xl bg-white border border-indigo-100 shadow-sm p-5 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Total</span>
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-base">📊</span>
        </div>
        <p class="text-3xl font-bold text-indigo-700 mt-1">{{ store.total }}</p>
        <p class="text-xs text-gray-400">En el sistema</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            v-model="filtros.tipo"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            @change="aplicarFiltros"
          >
            <option value="">Todos los tipos</option>
            <option v-for="t in TIPOS_ASAMBLEA" :key="t.value" :value="t.value">
              {{ t.icon }} {{ t.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            v-model="filtros.estado"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            @change="aplicarFiltros"
          >
            <option v-for="e in ESTADOS_ASAMBLEA" :key="e.value" :value="e.value">
              {{ e.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            v-model="filtros.fechaDesde"
            type="date"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            @change="aplicarFiltros"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            v-model="filtros.fechaHasta"
            type="date"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            @change="aplicarFiltros"
          />
        </div>
      </div>

      <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p class="text-xs text-gray-400">{{ store.total }} resultado{{ store.total !== 1 ? 's' : '' }}</p>
        <button
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Toggle vista -->
    <div class="flex items-center justify-end gap-2">
      <button
        :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', vista === 'cards' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']"
        @click="vista = 'cards'"
      >⊞ Tarjetas</button>
      <button
        :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', vista === 'tabla' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']"
        @click="vista = 'tabla'"
      >☰ Lista</button>
    </div>

    <!-- Loading skeleton -->
    <template v-if="store.loading">
      <div v-if="vista === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
          <div class="h-4 w-1/3 rounded bg-gray-200" />
          <div class="h-5 w-3/4 rounded bg-gray-200" />
          <div class="h-3 w-full rounded bg-gray-200" />
          <div class="h-3 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
        <div class="h-12 bg-gray-50 border-b border-gray-200" />
        <div v-for="i in 5" :key="i" class="h-14 border-b border-gray-100 px-5 flex items-center gap-3">
          <div class="h-3 w-48 rounded bg-gray-200" />
          <div class="h-3 w-24 rounded bg-gray-200" />
          <div class="h-5 w-20 rounded-full bg-gray-200 ml-auto" />
        </div>
      </div>
    </template>

    <!-- Vista tarjetas -->
    <div v-else-if="vista === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <AsambleaCard
        v-for="item in store.items"
        :key="item.id"
        :asamblea="item"
        @click="router.push(`/asambleas/${item.id}`)"
      />
      <div
        v-if="!store.items.length"
        class="col-span-full flex flex-col items-center py-20 text-gray-400"
      >
        <span class="text-5xl mb-4">🗓️</span>
        <p class="text-sm font-medium">No hay asambleas para mostrar</p>
        <p class="text-xs mt-1">Prueba cambiando los filtros</p>
      </div>
    </div>

    <!-- Vista tabla -->
    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div v-if="!store.items.length" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-5xl mb-4">🗓️</span>
        <p class="text-sm font-medium">No hay asambleas para mostrar</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Asamblea</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Fecha</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Lugar</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in store.items"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/asambleas/${item.id}`)"
          >
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2.5">
                <span class="text-lg leading-none">{{ tipoIcon(item.tipo) }}</span>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{{ item.asunto }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ item.numero_acta }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3.5 hidden sm:table-cell">
              <p class="text-sm text-gray-700">{{ formatDateShort(item.fecha_programada) }}</p>
              <p class="text-xs text-gray-400 capitalize">{{ tipoLabel(item.tipo) }}</p>
            </td>
            <td class="px-4 py-3.5 hidden md:table-cell">
              <p class="text-sm text-gray-600 truncate max-w-[150px]">{{ item.lugar ?? '—' }}</p>
            </td>
            <td class="px-4 py-3.5">
              <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', estadoBadgeClass(item.estado)]">
                {{ estadoLabel(item.estado) }}
              </span>
            </td>
            <td class="px-4 py-3.5 text-right" @click.stop>
              <button
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                @click="router.push(`/asambleas/${item.id}`)"
              >
                Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="store.pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p class="text-xs text-gray-500">
          Página {{ store.page }} de {{ store.pages }} · {{ store.total }} registros
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="store.page <= 1"
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            @click="store.changePage(store.page - 1)"
          >← Anterior</button>
          <button
            :disabled="store.page >= store.pages"
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            @click="store.changePage(store.page + 1)"
          >Siguiente →</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useAsambleasStore } from '../store/asambleas.store'
import {
  TIPOS_ASAMBLEA, ESTADOS_ASAMBLEA,
  estadoBadgeClass, estadoLabel, tipoIcon, tipoLabel, formatDateShort,
} from '../composables/useAsambleas'
import AsambleaCard from '../components/AsambleaCard.vue'
import type { AsambleaFilters } from '../types/asambleas.types'

const router    = useRouter()
const authStore = useAuthStore()
const store     = useAsambleasStore()

const vista = ref<'cards' | 'tabla'>('cards')

const filtros = ref<AsambleaFilters>({
  tipo:       '',
  estado:     '',
  fechaDesde: '',
  fechaHasta: '',
})

onMounted(() => store.fetchList())

function aplicarFiltros() {
  const f: AsambleaFilters = {}
  if (filtros.value.tipo)       f.tipo       = filtros.value.tipo
  if (filtros.value.estado)     f.estado     = filtros.value.estado
  if (filtros.value.fechaDesde) f.fechaDesde = new Date(filtros.value.fechaDesde!).toISOString()
  if (filtros.value.fechaHasta) f.fechaHasta = new Date(filtros.value.fechaHasta!).toISOString()
  store.applyFilters(f)
}

function limpiarFiltros() {
  filtros.value = { tipo: '', estado: '', fechaDesde: '', fechaHasta: '' }
  store.applyFilters({})
}
</script>
