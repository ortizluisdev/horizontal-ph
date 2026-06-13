<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Libro Mayor</h1>
        <p class="text-sm text-gray-500 mt-0.5">Registro de todos los movimientos contables</p>
      </div>
      <button
        @click="mostrarFormulario = true"
        class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        + Nuevo movimiento
      </button>
    </div>

    <!-- Balance rápido -->
    <BalanceCard
      titulo="Balance del período filtrado"
      :total_debitos="store.total_debitos"
      :total_creditos="store.total_creditos"
      :saldo="store.total_creditos - store.total_debitos"
    />

    <!-- Filtros -->
    <ReporteFilters @change="onFilter" />

    <!-- Error -->
    <div v-if="error" class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <span>⚠️</span> {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm text-gray-400">Cargando movimientos...</p>
    </div>

    <!-- Tabla -->
    <LibroMayorTable
      v-else
      :movimientos="store.list"
      @anular="onAnular"
    />

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2">
      <button
        @click="cambiarPagina(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-9 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >‹</button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="cambiarPagina(p)"
        :class="p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        class="w-9 h-9 rounded-lg border text-sm font-medium transition-colors"
      >{{ p }}</button>
      <button
        @click="cambiarPagina(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-9 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >›</button>
    </div>

    <!-- Modal nuevo movimiento -->
    <div v-if="mostrarFormulario" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="mostrarFormulario = false" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-base font-semibold text-gray-900">Registrar movimiento contable</h3>
          <button @click="mostrarFormulario = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div class="p-6">
          <MovimientoForm
            :loading="submitting"
            :error="submitError"
            @submit="onSubmit"
            @cancel="mostrarFormulario = false"
          />
        </div>
      </div>
    </div>

    <!-- Modal anular -->
    <div v-if="anulando" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="anulando = null" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Anular movimiento</h3>
        <p class="text-sm text-gray-600 mb-4">
          Esta acción es irreversible. Los movimientos contables no se eliminan, se marcan como anulados.
        </p>
        <div class="flex flex-col gap-1 mb-5">
          <label class="text-sm font-semibold text-gray-700">
            Motivo de anulación <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="motivoAnulacion"
            rows="3"
            placeholder="Describe el motivo (mínimo 10 caracteres)"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div class="flex gap-3">
          <button @click="anulando = null" class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50">
            Cancelar
          </button>
          <button
            @click="confirmarAnulacion"
            :disabled="motivoAnulacion.length < 10 || anulando === null"
            class="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Confirmar anulación
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useContabilidad } from '../composables/useContabilidad'
import { useContabilidadStore } from '../store/contabilidad.store'
import BalanceCard from '../components/BalanceCard.vue'
import ReporteFilters from '../components/ReporteFilters.vue'
import LibroMayorTable from '../components/LibroMayorTable.vue'
import MovimientoForm from '../components/MovimientoForm.vue'
import type { MovimientoCreateInput, MovimientoQuery } from '../types/contabilidad.types'

const { loading, error, cargarLista, crear, anular } = useContabilidad()
const store = useContabilidadStore()

const currentPage      = ref(1)
const limit            = 20
const activeFilters    = ref<MovimientoQuery>({})
const mostrarFormulario = ref(false)
const submitting       = ref(false)
const submitError      = ref<string | null>(null)
const anulando         = ref<string | null>(null)
const motivoAnulacion  = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(store.total / limit)))

function onFilter(filters: MovimientoQuery) {
  activeFilters.value = filters
  currentPage.value   = 1
  cargarLista({ ...filters, page: 1, limit })
}

function cambiarPagina(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  cargarLista({ ...activeFilters.value, page: p, limit })
}

async function onSubmit(data: MovimientoCreateInput) {
  submitting.value  = true
  submitError.value = null
  try {
    await crear(data)
    mostrarFormulario.value = false
    await cargarLista({ ...activeFilters.value, page: currentPage.value, limit })
  } catch (e: any) {
    submitError.value = e.response?.data?.message ?? 'Error al registrar movimiento'
  } finally {
    submitting.value = false
  }
}

function onAnular(id: string) {
  anulando.value        = id
  motivoAnulacion.value = ''
}

async function confirmarAnulacion() {
  if (!anulando.value || motivoAnulacion.value.length < 10) return
  await anular(anulando.value, { motivo_anulacion: motivoAnulacion.value })
  anulando.value = null
}

onMounted(() => cargarLista({ page: 1, limit }))
</script>