<template>
  <div class="space-y-5">
    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="!u" class="text-center py-20 text-gray-400">
      <p class="text-sm">Usuario no encontrado</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div :class="['flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white', avatarBgClass(u.tipo_usuario)]">
            <img v-if="u.avatar_url" :src="u.avatar_url" :alt="u.nombre" class="h-16 w-16 rounded-2xl object-cover" />
            <span v-else>{{ initialsFromName(u.nombre) }}</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ u.nombre }}</h1>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-sm text-gray-500">{{ u.email }}</span>
              <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {{ tipoIcon(u.tipo_usuario) }} {{ tipoLabel(u.tipo_usuario) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset', estadoBadgeClass(u.estado)]">
            <span :class="['h-2 w-2 rounded-full', estadoDotClass(u.estado)]" />
            {{ ESTADOS_USUARIO.find(e => e.value === u.estado)?.label }}
          </span>
          <button
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="router.push(`/usuarios/${u.id}/editar`)">Editar</button>
        </div>
      </div>

      <!-- Detalle -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Info principal -->
        <div class="lg:col-span-2 space-y-4">
          <div class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            <div v-for="row in infoRows" :key="row.label" class="flex items-center justify-between px-5 py-3.5 text-sm">
              <span class="text-gray-500">{{ row.label }}</span>
              <span class="font-medium text-gray-900 text-right text-xs">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="space-y-4">
          <div class="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Gestión</h3>

            <button v-if="u.estado === 'pendiente'"
              class="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
              @click="handleEstado('activo')">✅ Activar cuenta</button>

            <button v-if="u.estado === 'activo'"
              class="w-full rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
              @click="handleEstado('suspendido')">⏸ Suspender</button>

            <button v-if="u.estado === 'suspendido'"
              class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              @click="handleEstado('activo')">▶ Reactivar</button>

            <button v-if="['activo', 'suspendido'].includes(u.estado)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              :disabled="store.saving"
              @click="handleResetPassword">🔑 Resetear contraseña</button>

            <button v-if="u.estado !== 'activo'"
              class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
              @click="handleEliminar">🗑 Eliminar usuario</button>
          </div>

          <div v-if="resetMsg" class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {{ resetMsg }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsuariosStore } from '../store/usuarios.store'
import {
  tipoIcon, tipoLabel, estadoBadgeClass, estadoDotClass,
  avatarBgClass, initialsFromName, formatDate, formatRelativo, ESTADOS_USUARIO,
} from '../composables/useUsuarios'
import type { EstadoUsuario } from '../types/usuarios.types'

const route  = useRoute()
const router = useRouter()
const store  = useUsuariosStore()

const u        = computed(() => store.current)
const resetMsg = ref<string | null>(null)

onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())

const infoRows = computed(() => {
  if (!u.value) return []
  return [
    { label: 'Correo',          value: u.value.email },
    { label: 'Teléfono',        value: u.value.telefono ?? '-' },
    { label: 'Tipo',            value: tipoLabel(u.value.tipo_usuario) },
    { label: 'Conjunto',        value: u.value.conjunto_nombre ?? '-' },
    { label: 'Unidad',          value: u.value.unidad_numero ? `Unidad ${u.value.unidad_numero}` : '-' },
    { label: 'Último acceso',   value: u.value.ultimo_acceso ? formatRelativo(u.value.ultimo_acceso) : 'Nunca' },
    { label: 'Registrado',      value: formatDate(u.value.created_at) },
  ]
})

async function handleEstado(estado: EstadoUsuario) {
  if (u.value) await store.cambiarEstado(u.value.id, estado)
}

async function handleResetPassword() {
  if (!u.value || !confirm('¿Enviar correo de restablecimiento de contraseña?')) return
  const msg = await store.resetPassword(u.value.id)
  if (msg) { resetMsg.value = msg; setTimeout(() => { resetMsg.value = null }, 5000) }
}

async function handleEliminar() {
  if (!u.value || !confirm(`¿Eliminar a "${u.value.nombre}"? Esta acción no se puede deshacer.`)) return
  await store.remove(u.value.id)
  router.push('/usuarios')
}
</script>