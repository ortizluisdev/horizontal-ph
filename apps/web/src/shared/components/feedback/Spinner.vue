<template>
  <div class="flex justify-center items-center" :class="fullPage ? 'py-16' : ''">
    <div
      :class="sizeClass"
      class="border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}>(), { size: 'md' })

const sizeClass = computed(() => ({
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}[props.size]))
</script>