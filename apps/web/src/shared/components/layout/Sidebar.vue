<template>
  <aside
    :class="open ? 'w-64' : 'w-16'"
    class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-20"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
      <span class="text-blue-600 font-bold text-lg shrink-0">🏢</span>
      <span v-if="open" class="font-bold text-gray-900 truncate">Horizontal PH</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-colors"
        :class="$route.path.startsWith(item.to) && item.to !== '/'
          ? 'bg-blue-50 text-blue-700'
          : $route.path === '/' && item.to === '/'
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <span class="text-lg shrink-0">{{ item.icon }}</span>
        <span v-if="open" class="truncate">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Toggle -->
    <button
      @click="open = !open"
      class="flex items-center justify-center h-12 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {{ open ? '◀' : '▶' }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(true)

const menu = [
  { to: '/',              icon: '📊', label: 'Dashboard' },
  { to: '/conjuntos',     icon: '🏢', label: 'Conjuntos' },
  { to: '/unidades',      icon: '🏠', label: 'Unidades' },
  { to: '/cobranza',      icon: '💳', label: 'Cobranza' },
  { to: '/pqrs',          icon: '📝', label: 'PQRS' },
  { to: '/asambleas',     icon: '🗓', label: 'Asambleas' },
  { to: '/contabilidad',  icon: '📒', label: 'Contabilidad' },
  { to: '/normativa',     icon: '📋', label: 'Normativa' },
  { to: '/notificaciones',icon: '🔔', label: 'Notificaciones' },
  { to: '/usuarios',      icon: '👥', label: 'Usuarios' },
]
</script>