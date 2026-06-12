<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-2">
      <h2 class="text-sm font-semibold text-gray-700">{{ pageTitle }}</h2>
    </div>
    <div class="flex items-center gap-4">
      <router-link to="/notificaciones" class="text-gray-400 hover:text-gray-600 relative">
        <span class="text-xl">🔔</span>
      </router-link>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          {{ initials }}
        </div>
        <div v-if="user" class="hidden md:block">
          <p class="text-sm font-medium text-gray-900 leading-none">{{ user.nombre }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ user.role_name }}</p>
        </div>
      </div>
      <button @click="logout" class="text-sm text-gray-500 hover:text-red-600 transition-colors">
        Salir
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/modules/auth/composables/useAuth'

const { user, logout } = useAuth()
const route = useRoute()

const initials = computed(() => {
  if (!user?.nombre) return 'U'
  return user.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
})

const titles: Record<string, string> = {
  '/':               'Dashboard',
  '/conjuntos':      'Conjuntos',
  '/unidades':       'Unidades',
  '/cobranza':       'Cobranza',
  '/pqrs':           'PQRS',
  '/asambleas':      'Asambleas',
  '/contabilidad':   'Contabilidad',
  '/normativa':      'Normativa',
  '/notificaciones': 'Notificaciones',
  '/usuarios':       'Usuarios',
}

const pageTitle = computed(() => {
  for (const [path, title] of Object.entries(titles)) {
    if (route.path === path || route.path.startsWith(path + '/')) return title
  }
  return 'Horizontal PH'
})
</script>