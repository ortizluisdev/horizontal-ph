<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
      estadoBadgeClass(estado),
    ]"
  >
    <span :class="['h-1.5 w-1.5 rounded-full', dotColor]" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { estadoBadgeClass, ESTADOS_PQRS } from '../composables/usePqrs'
import type { EstadoPqrs } from '../types/pqrs.types'

const props = defineProps<{ estado: EstadoPqrs }>()

const label = computed(
  () => ESTADOS_PQRS.find((e) => e.value === props.estado)?.label ?? props.estado
)

const dotColor = computed(() => {
  const map: Record<EstadoPqrs, string> = {
    'abierta':    'bg-blue-500',
    'en proceso': 'bg-yellow-500',
    'resuelta':   'bg-green-500',
    'cerrada':    'bg-gray-400',
    'archivada':  'bg-gray-300',
  }
  return map[props.estado] ?? 'bg-gray-400'
})
</script>