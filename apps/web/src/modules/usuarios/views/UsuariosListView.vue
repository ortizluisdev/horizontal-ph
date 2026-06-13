<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Usuarios</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión de accesos y roles del sistema</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        @click="router.push('/usuarios/nuevo')">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo usuario
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-green-200 bg-green-50 p-4">
        <p class="text-2xl font-bold text-green-700">{{ store.activos }}</p>
        <p class="text-xs font-medium text-green-600 mt-0.5">Activos</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p class="text-2xl font-bold text-gray-700">{{ store.inactivos }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Inactivos</p>
      </div>
      <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p class="text-2xl font-bold text-yellow-700">{{ store.pendientes }}</p>
        <p class="text-xs font-medium text-yellow-600 mt-0.5">Pendientes</p>
      </div>
      <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p class="text-2xl font-bold text-indigo-700">{{ store.total }}</p>
        <p class="text-xs font-medium text-indigo-600 mt-0.5">Total</p>
      </div>
    </div>

    <!-- Filtros -->
    <UsuarioFilters v-model="filtros" @apply="store.applyFilters(filtros)" @reset="resetFiltros" />

    <!-- Toggle vista -->
    <div class="flex items-center justify-end gap-2">
      <button :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', vista === 'cards' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']"
        @click="vista = 'cards'">⊞ Tarjetas</button>
      <button :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', vista === 'tabla' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']"
        @click="vista = 'tabla'">☰ Tabla</button>
    </div>

    <!-- Skeleton -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 rounded-xl bg-gray-200" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-3/4 rounded bg-gray-200" />
            <div class="h-3 w-full rounded bg-gray-200" />
          </div>
        </div>
        <div class="h-3 w-1/2 rounded bg-gray-200" />
      </div>
    </div>

    <!-- Cards -->
    <div v-else-if="vista === 'cards'">
      <div v-if="!store.items.length" class="flex flex-col items-center py-16 text-gray-400">
        <span class="text-4xl mb-3">👥</span>
        <p class="text-sm">No hay usuarios registrados</p>
        <button class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          @click="router.push('/usuarios/nuevo')">Agregar primer usuario</button>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UsuarioCard
          v-for="u in store.items" :key="u.id" :usuario="u"
          @select="router.push(`/usuarios/${u.id}`)"
          @editar="router.push(`/usuarios/${u.id}/editar`)"
          @eliminar="handleEliminar(u)" />
      </div>
    </div>

    <!-- Tabla -->
    <UsuarioTable v-else
      :items="store.items" :page="store.page" :pages="store.pages" :total="store.total"
      show-admin
      @select="router.push(`/usuarios/${$event.id}`)"
      @editar="router.push(`/usuarios/${$event.id}/editar`)"
      @suspender="handleCambiarEstado($event, 'suspendido')"
      @activar="handleCambiarEstado($event, 'activo')"
      @page="store.changePage" />

    <!-- Paginación cards -->
    <div v-if="vista === 'cards' && store.pages > 1" class="flex items-center justify-between border-t border-gray-100 pt-4">
      <p class="text-xs text-gray-500">Página {{ store.page }} de {{ store.pages }} · {{ store.total }} usuarios</p>
      <div class="flex gap-1">
        <button :disabled="store.page === 1"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="store.changePage(store.page - 1)">Anterior</button>
        <button :disabled="store.page === store.pages"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="store.changePage(store.page + 1)">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuariosStore } from '../store/usuarios.store'
import UsuarioCard    from '../components/UsuarioCard.vue'
import UsuarioTable   from '../components/UsuarioTable.vue'
import UsuarioFilters from '../components/UsuarioFilters.vue'
import type { UsuarioFilters as Filters, Usuario, EstadoUsuario } from '../types/usuarios.types'

const router  = useRouter()
const store   = useUsuariosStore()
const vista   = ref<'cards' | 'tabla'>('cards')
const filtros = reactive<Filters>({ search: '', tipo_usuario: '', estado: '' })

onMounted(() => store.fetchList())

function resetFiltros() {
  filtros.search = ''; filtros.tipo_usuario = ''; filtros.estado = ''
  store.applyFilters(filtros)
}

async function handleEliminar(u: Usuario) {
  if (confirm(`¿Eliminar al usuario "${u.nombre}"? Esta acción no se puede deshacer.`))
    await store.remove(u.id)
}

async function handleCambiarEstado(u: Usuario, estado: EstadoUsuario) {
  const labels: Record<string, string> = { suspendido: 'suspender', activo: 'activar' }
  if (confirm(`¿${labels[estado]} a "${u.nombre}"?`))
    await store.cambiarEstado(u.id, estado)
}
</script>