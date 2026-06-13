<template>
  <div class="divide-y divide-gray-100">
    <div v-if="loading" class="space-y-0">
      <div v-for="i in 4" :key="i" class="flex items-start gap-3 px-4 py-3.5 animate-pulse">
        <div class="h-9 w-9 rounded-xl bg-gray-200 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-3/4 rounded bg-gray-200" />
          <div class="h-3 w-full rounded bg-gray-200" />
          <div class="h-3 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    </div>

    <template v-else-if="items.length">
      <NotificationItem
        v-for="notif in items"
        :key="notif.id"
        :notif="notif"
        @leer="emit('leer', $event)"
        @archivar="emit('archivar', $event)"
        @eliminar="emit('eliminar', $event)"
        @click="emit('click', $event)"
      />
    </template>

    <div v-else class="flex flex-col items-center py-12 text-gray-400">
      <span class="text-4xl mb-3">🔕</span>
      <p class="text-sm font-medium text-gray-500">Sin notificaciones</p>
      <p class="text-xs text-gray-400 mt-0.5">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notificacion } from '../types/notificaciones.types'
import NotificationItem from './NotificationItem.vue'

withDefaults(defineProps<{
  items: Notificacion[]
  loading?: boolean
  emptyMessage?: string
}>(), {
  loading: false,
  emptyMessage: 'Estás al día con todo',
})

const emit = defineEmits<{
  (e: 'leer',     id: string): void
  (e: 'archivar', id: string): void
  (e: 'eliminar', id: string): void
  (e: 'click',    notif: Notificacion): void
}>()
</script>