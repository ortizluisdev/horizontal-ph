<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        @click="$router.back()"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Volver"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-900">Detalle del conjunto</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Error -->
    <p
      v-else-if="error"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      {{ error }}
    </p>

    <!-- Contenido -->
    <template v-else-if="current">
      <!-- Encabezado del conjunto -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ current.nombre }}</h2>
            <p class="text-sm text-gray-500 mt-0.5">{{ current.direccion }}</p>
            <p v-if="current.ciudad" class="text-sm text-gray-400">
              {{ current.ciudad }}{{ current.departamento ? `, ${current.departamento}` : '' }}
              {{ current.pais ? ` — ${current.pais}` : '' }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <span :class="tipoBadge" class="text-xs font-medium px-2.5 py-1 rounded-full capitalize">
              {{ TIPO_CONJUNTO_LABELS[current.tipo_conjunto] ?? current.tipo_conjunto }}
            </span>
            <span
              :class="current.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {{ current.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Datos en grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Características -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Características</h3>
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Código catastral</dt>
              <dd class="text-sm text-gray-800 font-mono text-xs">{{ current.codigo_catastral ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Torres</dt>
              <dd class="text-sm text-gray-800">{{ current.numero_torres ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Unidades</dt>
              <dd class="text-sm text-gray-800">{{ current.numero_unidades ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Año construcción</dt>
              <dd class="text-sm text-gray-800">{{ current.anio_construccion ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Área total</dt>
              <dd class="text-sm text-gray-800">{{ current.area_total_m2 ? `${current.area_total_m2} m²` : '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Área común</dt>
              <dd class="text-sm text-gray-800">{{ current.area_comun_m2 ? `${current.area_comun_m2} m²` : '—' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Administración -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Administración y contacto</h3>
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Administrador</dt>
              <dd class="text-sm text-gray-800">{{ current.administrador_nombre ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Email admin</dt>
              <dd class="text-sm text-gray-800">{{ current.administrador_email ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Teléfono admin</dt>
              <dd class="text-sm text-gray-800">{{ current.administrador_telefono ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Emergencias</dt>
              <dd class="text-sm text-gray-800">{{ current.telefono_emergencia ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-gray-400">Email contacto</dt>
              <dd class="text-sm text-gray-800">{{ current.email_contacto ?? '—' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Metadatos -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-2 md:col-span-2">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Metadata</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <dt class="text-xs text-gray-400">ID</dt>
              <dd class="text-xs text-gray-600 font-mono">{{ current.id }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Tenant ID</dt>
              <dd class="text-xs text-gray-600 font-mono">{{ current.tenant_id }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Creado</dt>
              <dd class="text-sm text-gray-800">{{ formatDate(current.created_at) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Actualizado</dt>
              <dd class="text-sm text-gray-800">{{ formatDate(current.updated_at) }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3">
        <router-link
          :to="`/conjuntos/${current.id}/editar`"
          class="flex-1 text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Editar conjunto
        </router-link>
        <router-link
          :to="`/unidades?conjunto_id=${current.id}`"
          class="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Ver unidades
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConjuntos } from '../composables/useConjuntos'
import { TIPO_CONJUNTO_LABELS } from '../types/conjuntos.types'
import type { TipoConjunto } from '../types/conjuntos.types'

const route = useRoute()
const { current, loading, error, cargarPorId } = useConjuntos()

const tipoBadgeMap: Record<TipoConjunto, string> = {
  edificio:   'bg-blue-100 text-blue-700',
  casa:       'bg-green-100 text-green-700',
  ciudadela:  'bg-purple-100 text-purple-700',
  condominio: 'bg-yellow-100 text-yellow-700',
  otro:       'bg-gray-100 text-gray-500',
}

const tipoBadge = computed(
  () => current.value ? (tipoBadgeMap[current.value.tipo_conjunto] ?? 'bg-gray-100 text-gray-500') : ''
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}

onMounted(() => cargarPorId(route.params.id as string))
</script>