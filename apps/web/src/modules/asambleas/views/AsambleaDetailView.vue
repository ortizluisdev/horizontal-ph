<template>
  <div class="space-y-5">
    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="!a" class="text-center py-20 text-gray-400">
      <p class="text-sm">Asamblea no encontrada</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shrink-0">
            {{ tipoIcon(a.tipo) }}
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ a.asunto }}</h1>
            <p class="text-sm font-mono text-gray-400 mt-0.5">Acta {{ a.numero_acta }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset', estadoBadgeClass(a.estado)]">
            <span :class="['h-2 w-2 rounded-full', estadoDotClass(a.estado)]" />
            {{ ESTADOS_ASAMBLEA.find((e) => e.value === a.estado)?.label }}
          </span>
          <button
            v-if="authStore.isAdmin"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="router.push(`/asambleas/${a.id}/editar`)"
          >
            Editar
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Detalles principales -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Info card -->
          <div class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            <div v-for="row in detalleRows" :key="row.label" class="flex items-center justify-between px-5 py-3.5 text-sm">
              <span class="text-gray-500">{{ row.label }}</span>
              <span class="font-medium text-gray-900 text-right">{{ row.value }}</span>
            </div>
          </div>

          <!-- Notas -->
          <div v-if="a.notas" class="rounded-xl border border-gray-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Notas / Agenda</h3>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ a.notas }}</p>
          </div>

          <!-- Ir a votación -->
          <button
            v-if="['programada', 'en_curso'].includes(a.estado)"
            class="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            @click="router.push(`/asambleas/${a.id}/votacion`)"
          >
            🗳️ Ir a la sala de votación
          </button>
        </div>

        <!-- Panel lateral acciones -->
        <div class="space-y-4">
          <!-- Quórum visual -->
          <div v-if="a.quorum_requerido" class="rounded-xl border border-gray-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Quórum requerido</h3>
            <div class="text-center space-y-2">
              <p class="text-4xl font-bold text-indigo-600">{{ a.quorum_requerido }}%</p>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full transition-all" :style="{ width: `${a.quorum_requerido}%` }" />
              </div>
              <p class="text-xs text-gray-500">del total de propietarios</p>
            </div>
          </div>

          <!-- Acciones admin -->
          <div v-if="authStore.isAdmin" class="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Gestión</h3>

            <button
              v-if="a.estado === 'programada'"
              :disabled="processing"
              class="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 transition-colors"
              @click="handleCambio('en_curso')"
            >▶ Iniciar asamblea</button>

            <button
              v-if="a.estado === 'en_curso'"
              :disabled="processing"
              class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
              @click="handleCambio('realizada')"
            >✓ Finalizar asamblea</button>

            <button
              v-if="['programada', 'en_curso'].includes(a.estado)"
              :disabled="processing"
              class="w-full rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60 transition-colors"
              @click="handleCambio('pospuesta')"
            >⏸ Posponer</button>

            <button
              v-if="!['cancelada', 'realizada'].includes(a.estado)"
              :disabled="processing"
              class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors"
              @click="handleCambio('cancelada')"
            >✕ Cancelar asamblea</button>

            <button
              v-if="['programada', 'cancelada'].includes(a.estado)"
              :disabled="processing"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
              @click="handleEliminar"
            >🗑 Eliminar</button>

            <p v-if="estadoError" class="text-xs text-red-600 mt-2">{{ estadoError }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { useAsambleaEstado, tipoIcon, estadoBadgeClass, estadoDotClass, formatDateTime, ESTADOS_ASAMBLEA } from '../composables/useAsambleas'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { EstadoAsamblea } from '../types/asambleas.types'

const route     = useRoute()
const router    = useRouter()
const store     = useAsambleasStore()
const authStore = useAuthStore()
const { processing, error: estadoError, cambiarEstado } = useAsambleaEstado()

const a = computed(() => store.current)

onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())

const detalleRows = computed(() => {
  if (!a.value) return []
  return [
    { label: 'Tipo',             value: a.value.tipo },
    { label: 'Fecha programada', value: formatDateTime(a.value.fecha_programada) },
    { label: 'Lugar',            value: a.value.lugar ?? '-' },
    { label: 'Quórum requerido', value: a.value.quorum_requerido ? `${a.value.quorum_requerido}%` : '-' },
    { label: 'Creada el',        value: new Date(a.value.created_at).toLocaleDateString('es-CO') },
  ]
})

async function handleCambio(estado: EstadoAsamblea) {
  const labels: Record<EstadoAsamblea, string> = {
    programada: 'reprogramar', en_curso: 'iniciar', realizada: 'finalizar',
    cancelada: 'cancelar', pospuesta: 'posponer',
  }
  if (confirm(`¿${labels[estado]} esta asamblea?`)) {
    await cambiarEstado(a.value!.id, estado)
  }
}

async function handleEliminar() {
  if (confirm('¿Eliminar esta asamblea? Esta acción no se puede deshacer.')) {
    await store.remove(a.value!.id)
    router.push('/asambleas')
  }
}
</script>