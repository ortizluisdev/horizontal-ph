<template>
  <div class="relative" ref="containerRef">
    <!-- Botón campana -->
    <button
      :class="[
        'relative rounded-xl p-2 transition-colors',
        open ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
      ]"
      @click="toggle"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <NotificationBadge
        v-if="store.hayNoLeidas"
        :count="store.noLeidas"
        :urgente="store.urgentes.length > 0"
        small
        class="absolute -top-0.5 -right-0.5"
      />
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full mt-2 w-96 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-gray-900">Notificaciones</h3>
            <NotificationBadge v-if="store.hayNoLeidas" :count="store.noLeidas" />
          </div>
          <div class="flex items-center gap-1">
            <button v-if="store.hayNoLeidas" :disabled="store.saving"
              class="rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
              @click="store.marcarTodasLeidas()">
              Marcar todas leídas
            </button>
            <router-link to="/notificaciones"
              class="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              @click="open = false">
              Ver todas
            </router-link>
          </div>
        </div>

        <!-- Lista recientes -->
        <div class="max-h-[420px] overflow-y-auto">
          <NotificationList
            :items="store.recientes"
            :loading="store.loading"
            empty-message="No tienes notificaciones recientes"
            @leer="store.marcarLeida($event)"
            @archivar="handleArchivar($event)"
            @eliminar="handleEliminar($event)"
            @click="open = false"
          />
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
          <router-link to="/notificaciones"
            class="block text-center text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            @click="open = false">
            Ver todas las notificaciones →
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificacionesStore } from '../store/notificaciones.store'
import NotificationBadge from './NotificationBadge.vue'
import NotificationList  from './NotificationList.vue'

const store = useNotificacionesStore()
const open  = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
  if (open.value) store.fetchList({ limit: 10, archivada: false })
}

function handleArchivar(id: string) { store.archivar(id) }
function handleEliminar(id: string) { store.eliminar(id) }

function onClickOutside(e: MouseEvent) {
  if (open.value && containerRef.value && !containerRef.value.contains(e.target as Node))
    open.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  store.fetchNoLeidas()
})
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>