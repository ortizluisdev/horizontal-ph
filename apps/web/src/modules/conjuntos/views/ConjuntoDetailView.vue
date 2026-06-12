<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="text-gray-400 hover:text-gray-600 transition-colors">
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
    <p v-else-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{{ error }}</p>

    <!-- Contenido -->
    <template v-else-if="current">
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <!-- Nombre y badges -->
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ current.nombre }}</h2>
            <p class="text-sm text-gray-500 mt-0.5">{{ current.direccion }}</p>
          </div>
          <div class="flex gap-2">
            <span class="capitalize text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              {{ current.tipo_conjunto ?? 'Sin tipo' }}
            </span>
            <span
              :class="current.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {{ current.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <!-- Datos -->
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">Ciudad</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ current.ciudad ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">ID Tenant</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono text-xs">{{ current.tenant_id }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">Creado</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(current.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">Actualizado</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(current.updated_at) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3">
        <router-link
          :to="`/conjuntos/${current.id}/editar`"
          class="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Editar conjunto
        </router-link>
        <router-link
          :to="`/unidades?conjunto_id=${current.id}`"
          class="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Ver unidades
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConjuntos } from '../composables/useConjuntos'

const route = useRoute()
const { current, loading, error, cargarPorId } = useConjuntos()

onMounted(() => cargarPorId(route.params.id as string))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}
</script>