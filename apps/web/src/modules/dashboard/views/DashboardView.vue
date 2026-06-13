<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-sm text-gray-500 mt-0.5">Resumen general del conjunto</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-xl border border-gray-200 bg-white p-5 space-y-2"
      >
        <p class="text-xs font-medium text-gray-500">{{ card.label }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
        <RouterLink
          :to="card.to"
          class="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Ver detalle →
        </RouterLink>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-400">
      <svg class="mx-auto h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3
             m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <p class="text-sm">Bienvenido al panel de administración de Horizontal PH</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const cards = [
  { label: 'Cobranza pendiente', value: '—', to: '/cobranza' },
  { label: 'PQRS abiertas',      value: '—', to: '/pqrs' },
  { label: 'Próximas asambleas', value: '—', to: '/asambleas' },
  { label: 'Unidades activas',   value: '—', to: '/unidades' },
]
</script>