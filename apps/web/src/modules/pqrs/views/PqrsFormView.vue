<template>
  <div class="max-w-2xl mx-auto space-y-5">
    <button
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group"
      @click="router.back()"
    >
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <PqrsForm @close="router.back()" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import PqrsForm from '../components/PqrsForm.vue'
import type { Pqrs } from '../types/pqrs.types'

const router = useRouter()

function onSaved(pqrs: Pqrs) {
  router.push(`/pqrs/${pqrs.id}`)
}
</script>