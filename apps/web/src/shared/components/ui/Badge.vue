<template>
  <span :class="[colorClass, 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
}>(), { color: 'gray' })

const colorClass = computed(() => ({
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-700',
  gray:   'bg-gray-100 text-gray-600',
}[props.color]))
</script>