<template>
  <div
    class="group bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer space-y-4"
    @click="emit('select', usuario)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Avatar -->
        <div :class="['flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white', avatarBgClass(usuario.tipo_usuario)]">
          <img v-if="usuario.avatar_url" :src="usuario.avatar_url" :alt="usuario.nombre"
            class="h-11 w-11 rounded-xl object-cover" />
          <span v-else>{{ initialsFromName(usuario.nombre) }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ usuario.nombre }}</p>
          <p class="text-xs text-gray-400 truncate">{{ usuario.email }}</p>
        </div>
      </div>
      <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0', estadoBadgeClass(usuario.estado)]">
        <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(usuario.estado)]" />
        {{ ESTADOS_USUARIO.find(e => e.value === usuario.estado)?.label }}
      </span>
    </div>

    <!-- Tipo -->
    <div class="flex items-center gap-2">
      <span class="text-base">{{ tipoIcon(usuario.tipo_usuario) }}</span>
      <span class="text-xs font-medium text-gray-600">{{ tipoLabel(usuario.tipo_usuario) }}</span>
    </div>

    <!-- Info -->
    <div class="space-y-1.5 text-xs text-gray-500">
      <div v-if="usuario.conjunto_nombre" class="flex items-center gap-2">
        <span class="text-gray-400">🏢</span>
        <span class="truncate">{{ usuario.conjunto_nombre }}</span>
      </div>
      <div v-if="usuario.unidad_numero" class="flex items-center gap-2">
        <span class="text-gray-400">🏠</span>
        <span>Unidad {{ usuario.unidad_numero }}</span>
      </div>
      <div v-if="usuario.telefono" class="flex items-center gap-2">
        <span class="text-gray-400">📞</span>
        <span>{{ usuario.telefono }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-1 border-t border-gray-100">
      <span class="text-xs text-gray-400">
        {{ usuario.ultimo_acceso ? `Último acceso ${formatRelativo(usuario.ultimo_acceso)}` : 'Sin acceso registrado' }}
      </span>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Editar"
          @click.stop="emit('editar', usuario)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          class="rounded-md p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar"
          @click.stop="emit('eliminar', usuario)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Usuario } from '../types/usuarios.types'
import {
  tipoIcon, tipoLabel, estadoBadgeClass, estadoDotClass,
  avatarBgClass, initialsFromName, formatRelativo, ESTADOS_USUARIO,
} from '../composables/useUsuarios'

defineProps<{ usuario: Usuario }>()
const emit = defineEmits<{
  (e: 'select',   u: Usuario): void
  (e: 'editar',   u: Usuario): void
  (e: 'eliminar', u: Usuario): void
}>()
</script>