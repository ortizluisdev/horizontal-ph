<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">
            <slot name="empty">Sin resultados</slot>
          </td>
        </tr>
        <tr v-for="(row, i) in rows" :key="i" class="hover:bg-gray-50 transition-colors">
          <slot :row="row" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string }[]
  rows: unknown[]
}>()
</script>