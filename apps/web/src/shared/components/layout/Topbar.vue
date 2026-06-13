<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-2">
      <h2 class="text-sm font-semibold text-gray-700">{{ pageTitle }}</h2>
    </div>

    <div class="flex items-center gap-3">
      <!-- Campana de notificaciones -->
      <NotificationBell />

      <!-- Avatar + nombre -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
          {{ initials }}
        </div>
        <div v-if="authStore.user" class="hidden md:block">
          <p class="text-sm font-medium text-gray-900 leading-none">{{ authStore.user.nombre }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ authStore.user.role_name ?? authStore.user.tipo_usuario }}</p>
        </div>
      </div>

      <button
        class="text-sm text-gray-500 hover:text-red-600 transition-colors"
        @click="handleLogout"
      >
        Salir
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import NotificationBell from '@/modules/notificaciones/components/NotificationBell.vue'

const authStore = useAuthStore()
const route     = useRoute()
const router    = useRouter()

const initials = computed(() => {
  const nombre = authStore.user?.nombre
  if (!nombre) return 'U'
  return nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
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

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>