<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm" :class="padding ? 'p-6' : ''">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ padding?: boolean }>(), { padding: true })
</script>