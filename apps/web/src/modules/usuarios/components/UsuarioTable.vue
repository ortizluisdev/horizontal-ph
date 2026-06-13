<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div v-if="!items.length" class="flex flex-col items-center py-16 text-gray-400">
      <span class="text-4xl mb-3">👥</span>
      <p class="text-sm">No hay usuarios registrados</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3 text-left">Usuario</th>
            <th class="px-5 py-3 text-left">Tipo</th>
            <th class="px-5 py-3 text-left">Conjunto / Unidad</th>
            <th class="px-5 py-3 text-left">Último acceso</th>
            <th class="px-5 py-3 text-center">Estado</th>
            <th class="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="u in items" :key="u.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="emit('select', u)"
          >
            <!-- Usuario -->
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white', avatarBgClass(u.tipo_usuario)]">
                  <img v-if="u.avatar_url" :src="u.avatar_url" :alt="u.nombre" class="h-9 w-9 rounded-xl object-cover" />
                  <span v-else>{{ initialsFromName(u.nombre) }}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ u.nombre }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <!-- Tipo -->
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-1.5 text-xs text-gray-600">
                <span>{{ tipoIcon(u.tipo_usuario) }}</span>
                <span>{{ tipoLabel(u.tipo_usuario) }}</span>
              </div>
            </td>
            <!-- Conjunto / Unidad -->
            <td class="px-5 py-3.5 text-xs text-gray-500">
              <p v-if="u.conjunto_nombre" class="truncate max-w-[160px]">{{ u.conjunto_nombre }}</p>
              <p v-if="u.unidad_numero" class="text-gray-400">Unidad {{ u.unidad_numero }}</p>
              <span v-if="!u.conjunto_nombre && !u.unidad_numero" class="text-gray-300">—</span>
            </td>
            <!-- Último acceso -->
            <td class="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
              {{ u.ultimo_acceso ? formatRelativo(u.ultimo_acceso) : '—' }}
            </td>
            <!-- Estado -->
            <td class="px-5 py-3.5 text-center">
              <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', estadoBadgeClass(u.estado)]">
                <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(u.estado)]" />
                {{ ESTADOS_USUARIO.find(e => e.value === u.estado)?.label }}
              </span>
            </td>
            <!-- Acciones -->
            <td class="px-5 py-3.5 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button
                  class="rounded-md p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Editar"
                  @click="emit('editar', u)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button v-if="showAdmin && u.estado === 'activo'"
                  class="rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors"
                  @click="emit('suspender', u)">Suspender</button>
                <button v-if="showAdmin && u.estado === 'suspendido'"
                  class="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                  @click="emit('activar', u)">Activar</button>
                <button
                  class="rounded-md p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  @click="emit('select', u)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="pages > 1" class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p class="text-xs text-gray-500">Página {{ page }} de {{ pages }} · {{ total }} usuarios</p>
      <div class="flex gap-1">
        <button :disabled="page === 1"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('page', page - 1)">Anterior</button>
        <button :disabled="page === pages"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('page', page + 1)">Siguiente</button>
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

defineProps<{
  items: Usuario[]
  page: number
  pages: number
  total: number
  showAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'select',    u: Usuario): void
  (e: 'editar',    u: Usuario): void
  (e: 'suspender', u: Usuario): void
  (e: 'activar',   u: Usuario): void
  (e: 'page',      p: number): void
}>()
</script>