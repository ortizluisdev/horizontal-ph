<template>
  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
    <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
      {{ initials }}
    </span>
    <span class="max-w-[140px] truncate">{{ nombre }}</span>
    <button
      v-if="removable"
      @click.stop="$emit('remove')"
      class="ml-0.5 text-blue-400 hover:text-red-500 transition-colors leading-none font-bold"
      title="Quitar residente"
    >
      ×
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  nombre: string
  removable?: boolean
}>()

defineEmits<{ (e: 'remove'): void }>()

const initials = computed(() =>
  props.nombre
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
</script>