<template>
  <span
    v-if="count > 0"
    :class="[
      'inline-flex items-center justify-center rounded-full font-bold text-white transition-all',
      small ? 'h-4 w-4 text-[10px]' : 'h-5 min-w-[20px] px-1 text-xs',
      urgente ? 'bg-red-500 animate-pulse' : 'bg-indigo-600',
    ]"
  >
    {{ display }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  count: number
  urgente?: boolean
  small?: boolean
}>(), { urgente: false, small: false })

const display = computed(() => props.count > 99 ? '99+' : String(props.count))
</script>