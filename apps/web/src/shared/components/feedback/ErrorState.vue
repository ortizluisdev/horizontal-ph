<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <span class="text-5xl mb-4">⚠️</span>
    <h3 class="text-base font-semibold text-gray-900 mb-1">Ocurrió un error</h3>
    <p class="text-sm text-red-600 mb-4 max-w-xs">{{ message }}</p>
    <button
      v-if="onRetry"
      @click="onRetry"
      class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      Reintentar
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string; onRetry?: () => void }>()
</script>