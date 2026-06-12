<template>
  <div class="max-w-3xl mx-auto p-6">
    <RouterLink :to="`/asambleas/${route.params.id}`" class="text-sm text-blue-600 hover:underline block mb-2">
      ← Volver a la asamblea
    </RouterLink>
    <h1 class="text-xl font-bold text-slate-800 mb-4">Votación</h1>
    <p class="text-slate-500">Módulo de votación en desarrollo.</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
